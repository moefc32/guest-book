import { Elysia } from 'elysia';
import bearer from '@elysiajs/bearer';
import { UnauthorizedError } from '$source/elysia';
import { timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$db/drizzle';
import { MicroserviceKeys } from '$db/schema';

export default new Elysia({ name: 'm2m-auth' })
    .use(bearer())
    .onBeforeHandle({ as: 'global' }, async ({ bearer }) => {
        const idx = bearer?.lastIndexOf('_');
        let isValid = false;

        if (idx && idx > 0) {
            const name = bearer.substring(0, idx);

            const [record] = await db.select({
                hash: MicroserviceKeys.hash
            })
                .from(MicroserviceKeys)
                .where(eq(MicroserviceKeys.name, name))
                .limit(1);

            if (record) {
                const recordBuffer = Buffer.from(record.hash, 'hex')
                const incomingBuffer =
                    Buffer.from(new Bun.CryptoHasher('sha256')
                        .update(bearer).digest('hex'));

                if (recordBuffer.length === incomingBuffer.length) {
                    isValid = timingSafeEqual(recordBuffer, incomingBuffer);
                }
            }
        }

        if (!isValid) throw new UnauthorizedError();
    });
