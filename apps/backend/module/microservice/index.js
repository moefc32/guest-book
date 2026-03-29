import {
    APP_NAME,
    ALLOW_REGISTER_SERVICE,
} from '$config';
import { Elysia, t, NotFoundError } from 'elysia';
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$db/drizzle';
import { MicroserviceKeys } from '$db/schema';

export default new Elysia({ name: 'microservice' })
    .post('/', async ({ body, status }) => {
        if (!ALLOW_REGISTER_SERVICE) throw new NotFoundError();

        const [existing] = await db.select({ id: MicroserviceKeys.id })
            .from(MicroserviceKeys)
            .where(eq(MicroserviceKeys.name, body.name))
            .limit(1);

        if (existing) {
            return status(409, {
                application: APP_NAME,
                message: 'Service name already exists!',
            });
        }

        const entropy = randomBytes(16).toString('hex');
        const serviceKey = `${body.name}_${entropy}`;
        const serviceHash = new Bun.CryptoHasher('sha256')
            .update(serviceKey).digest('hex');

        await db.insert(MicroserviceKeys).values({
            name: body.name,
            hash: serviceHash,
        });

        return status(200, {
            application: APP_NAME,
            message: 'New service key registered successfully.',
            data: serviceKey,
        });
    }, {
        body: t.Object({
            name: t.String({
                maxLength: 16,
                error: 'Service name must be 16 characters or less!',
            }),
        }),
    });
