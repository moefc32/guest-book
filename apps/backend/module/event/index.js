import { APP_NAME } from '$config';
import { Elysia, t, NotFoundError, InvalidFileType } from 'elysia';
import { $ } from 'bun';
import { join } from 'node:path';
import m2mAuth from '$security/m2mAuth';
import { asc, desc, eq } from 'drizzle-orm';
import { Guests, Events, Units } from '$db/schema';
import db from '$db/drizzle';
import pngConvert from '$utility/pngConvert';

const PUBLIC_PATH = join(process.cwd(), 'public');
const ALLOWED_MIMES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

const TypeBody = t.Object({
    name: t.String({
        minLength: 1,
        maxLength: 100,
    }),
    place: t.String({
        minLength: 1,
        maxLength: 250,
    }),
    organizer: t.String({
        minLength: 1,
        maxLength: 100,
    }),
    chief: t.String({
        minLength: 1,
        maxLength: 100,
    }),
    isDatetime: t.Boolean(),
    enableForm: t.Boolean(),
    labelId: t.Optional(t.String({
        minLength: 1,
        maxLength: 30,
    })),
    labelUnit: t.Optional(t.String({
        minLength: 1,
        maxLength: 30,
    })),
});

export default new Elysia({ name: 'event-routes' })
    .group('/', (app) => app
        .use(m2mAuth)
        .post('/', async ({ body, status }) => {
            const [newEvent] = await db
                .insert(Events)
                .values(body)
                .returning();

            return status(200, {
                application: APP_NAME,
                message: 'Create new event data success.',
                data: newEvent,
            });
        }, {
            body: TypeBody,
        })
        .guard({
            params: t.Object({
                id: t.String({ format: 'uuid' }),
            }),
        }, (app) => app
            .get('/:id', async ({ params: { id }, query, status }) => {
                const [eventData] = await db
                    .select({
                        id: Events.id,
                        name: Events.name,
                        place: Events.place,
                        organizer: Events.organizer,
                        chief: Events.chief,
                        isLogoProvided: Events.isLogoProvided,
                        isDatetime: Events.isDatetime,
                        enableForm: Events.enableForm,
                        labelId: Events.labelId,
                        labelUnit: Events.labelUnit,
                    })
                    .from(Events)
                    .where(eq(Events.publicId, id))
                    .limit(1);

                if (!eventData) throw new NotFoundError();

                const { id: eventId, ...config } = eventData;
                const [units, guests] = await Promise.all([
                    db
                        .select({
                            name: Units.name,
                            createdAt: Units.createdAt,
                        })
                        .from(Units)
                        .where(eq(Units.eventId, eventId))
                        .orderBy(asc(Units.sortOrder)),

                    db
                        .select({
                            id: Guests.id,
                            name: Guests.name,
                            identity: Guests.identity,
                            unitId: Guests.unitId,
                            unitName: Guests.unitName,
                            email: Guests.email,
                            phone: Guests.phone,
                            createdAt: Guests.createdAt,
                        })
                        .from(Guests)
                        .where(eq(Guests.eventId, eventId))
                        .orderBy(desc(Guests.createdAt))
                ]);

                return status(200, {
                    application: APP_NAME,
                    message: 'Get event data success.',
                    data: {
                        config,
                        units,
                        guests,
                    },
                });
            }, {
                query: t.Object({
                    print: t.Optional(t.Boolean({ default: false })),
                }),
            })
            .patch('/:id', async ({ params: { id }, body, status }) => {
                await db
                    .update(Events)
                    .set(body)
                    .where(eq(Events.publicId, id));

                return status(200, {
                    application: APP_NAME,
                    message: 'Edit event data success.',
                });
            }, {
                body: t.Partial(TypeBody),
            })
            .delete('/:id', async ({ params: { id }, status }) => {
                await $`rm -f ./public/${id}`.quiet();
                await db.delete(Events).where(eq(Events.publicId, id));

                return status(200, {
                    application: APP_NAME,
                    message: 'Delete event data success.',
                });
            })
            .patch('/:id/logo', async ({ params: { id }, body, status }) => {
                if (!ALLOWED_MIMES[body.logo.type])
                    throw new InvalidFileType();

                const [current] = await db
                    .select({
                        id: Events.publicId,
                        isLogoProvided: Events.isLogoProvided,
                    })
                    .from(Events)
                    .where(eq(Events.publicId, id))
                    .limit(1);

                if (current?.isLogoProvided)
                    await $`rm -f ./public/${current.id}`.quiet();

                const optimizedBuffer = await pngConvert(body.logo);
                const fileName = `${current.id}.png`;
                const imagePath = join(PUBLIC_PATH, fileName);

                await Bun.write(imagePath, optimizedBuffer);
                await db
                    .update(Events)
                    .set({ isLogoProvided: true })
                    .where(eq(Events.publicId, id));

                return status(200, {
                    application: APP_NAME,
                    message: 'Update event data success.',
                });
            }, {
                body: t.Object({
                    logo: t.File({ type: 'image' }),
                }),
            })
            .delete('/:id/logo', async ({ params: { id }, status }) => {
                const [current] = await db
                    .select({
                        id: Events.publicId,
                        isLogoProvided: Events.isLogoProvided,
                    })
                    .from(Events)
                    .where(eq(Events.publicId, id))
                    .limit(1);

                if (current?.isLogoProvided) {
                    const fileName = `${current.id}.png`;
                    const imagePath = join(PUBLIC_PATH, fileName);

                    await $`rm -f ${imagePath}`.quiet();
                    await db
                        .update(Events)
                        .set({ isLogoProvided: false })
                        .where(eq(Events.publicId, id));
                }

                return status(200, {
                    application: APP_NAME,
                    message: 'Delete event data success.',
                });
            })
        )
    );
