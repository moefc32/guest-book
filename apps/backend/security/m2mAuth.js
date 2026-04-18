import { Elysia } from 'elysia';
import { UnauthorizedError } from '$source/elysia';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { MicroserviceSecrets } from '$db/schema';
import db from '$db/drizzle';

export default new Elysia({ name: 'm2m-auth' })
    .onBeforeHandle({ as: 'global' }, async ({ request }) => {
        const serviceId = request.headers.get('x-service-id');
        const timestamp = request.headers.get('x-timestamp');
        const nonce = request.headers.get('x-nonce');
        const signature = request.headers.get('x-signature');

        let isValid = false;

        if (serviceId && timestamp && nonce && signature) {
            const now = Math.floor(Date.now() / 1000);

            if (Math.abs(now - Number(timestamp)) <= 30) {
                const [record] = await db.select({
                    secret: MicroserviceSecrets.secret
                })
                    .from(MicroserviceSecrets)
                    .where(eq(MicroserviceSecrets.name, serviceId))
                    .limit(1);

                if (record) {
                    const url = new URL(request.url);
                    const path = url.pathname + url.search;

                    const payload = `${request.method}:${path}:${timestamp}:${nonce}`;
                    const expected = createHmac('sha256', record.secret)
                        .update(payload).digest('hex');

                    if (expected.length === signature.length) {
                        isValid = timingSafeEqual(
                            Buffer.from(expected, 'hex'),
                            Buffer.from(signature, 'hex')
                        );
                    }
                }
            }
        }

        if (!isValid) throw new UnauthorizedError();
    });
