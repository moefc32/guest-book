import { APP_NAME } from '$config';
import { Elysia, t, InvalidFileType } from 'elysia';
import { $ } from 'bun';
import { join } from 'node:path';
import m2mAuth from '$security/m2mAuth';
import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '$db/drizzle';
import { Configs, Units } from '$db/schema';
import pngConvert from '$utility/pngConvert';

const PUBLIC_PATH = join(process.cwd(), 'public');
const ALLOWED_MIMES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

const TypeBody = t.Object({
    name: t.String({ maxLength: 100 }),
    place: t.String({ maxLength: 250 }),
    organizer: t.String({ maxLength: 100 }),
    chief: t.String({ maxLength: 100 }),
    labelId: t.String({ maxLength: 30 }),
    labelUnit: t.String({ maxLength: 30 }),
    editUnits: t.Array(
        t.Object({
            id: t.Optional(t.Integer()),
            name: t.String({ maxLength: 100 }),
            sortOrder: t.Integer(),
        })
    ),
    deleteUnits: t.Array(t.Integer()),
});

export default new Elysia({ name: 'config-routes' })
    .group('/', (app) => app
        .use(m2mAuth)
        .get('/', async ({ status }) => {
            const [checkConfig, units] = await Promise.all([
                db.select().from(Configs).limit(1),

                db
                    .select({
                        name: Units.name,
                        createdAt: Units.createdAt,
                    })
                    .from(Units)
                    .orderBy(asc(Units.sortOrder))
                    .limit(1)
            ]);

            const [config] = checkConfig.length
                ? checkConfig
                : await db.insert(Configs).returning();

            return status(200, {
                application: APP_NAME,
                message: 'Get config data success.',
                data: {
                    config,
                    units,
                },
            });
        })
        .patch('/', async ({ body, status }) => {
            const { editUnits, deleteUnits, ...configData } = body;

            await db.transaction(async (tx) => {
                if (Object.keys(configData).length > 0)
                    await tx.update(Configs).set(configData);

                if (deleteUnits?.length)
                    await tx
                        .delete(Units)
                        .where(inArray(Units.id, deleteUnits));

                if (editUnits?.length) {
                    for (const unit of editUnits) {
                        if (unit.id) {
                            await tx
                                .update(Units)
                                .set(unit)
                                .where(eq(Units.id, unit.id));
                        } else {
                            await tx.insert(Units).values(unit);
                        }
                    }
                }
            });

            return status(200, {
                application: APP_NAME,
                message: 'Edit config data success.',
            });
        }, {
            body: t.Partial(TypeBody),
        })
        .patch('/logo', async ({ body, status }) => {
            if (!ALLOWED_MIMES[body.logo.type])
                throw new InvalidFileType();

            const [current] = await db
                .select({
                    id: Configs.id,
                    isLogoProvided: Configs.isLogoProvided,
                })
                .from(Configs)
                .limit(1);

            if (current?.isLogoProvided)
                await $`rm -f ./public/${current.id}`.quiet();

            const optimizedBuffer = await pngConvert(body.logo);
            const fileName = `${current.id}.png`;
            const imagePath = join(PUBLIC_PATH, fileName);

            await Bun.write(imagePath, optimizedBuffer);
            await db.update(Configs)
                .set({ isLogoProvided: true });

            return status(200, {
                application: APP_NAME,
                message: 'Edit config data success.',
            });
        }, {
            body: t.Object({
                logo: t.File({ type: 'image' }),
            }),
        })
        .delete('/logo', async ({ status }) => {
            const [current] = await db
                .select({
                    id: Configs.id,
                    isLogoProvided: Configs.isLogoProvided,
                })
                .from(Configs)
                .limit(1);

            if (current?.isLogoProvided) {
                const fileName = `${current.id}.png`;
                const imagePath = join(PUBLIC_PATH, fileName);

                await $`rm -f ${imagePath}`.quiet();
                await db.update(Configs)
                    .set({ isLogoProvided: false });
            }

            return status(200, {
                application: APP_NAME,
                message: 'Delete config data success.',
            });
        })
    );
