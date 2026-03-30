import { APP_NAME } from '$config';
import { Elysia, t } from 'elysia';
import m2mAuth from '$security/m2mAuth';
import { eq } from 'drizzle-orm';
import { db } from '$db/drizzle';
import { Guests } from '$db/schema';

const TypeBody = t.Object({
    name: t.String({ maxLength: 50 }),
    identity: t.Optional(t.String({ maxLength: 20 })),
    unitName: t.Optional(t.String({ maxLength: 100 })),
    unitId: t.Optional(t.Integer()),
    email: t.String({ format: 'email', maxLength: 255 }),
    phone: t.Optional(t.String({ maxLength: 20 })),
});

export default new Elysia({ name: 'guest-routes' })
    .group('/', (app) => app
        .use(m2mAuth)
        .post('/:event', async ({ params: { event }, body, status }) => {
            const [newGuest] = await db
                .insert(Guests).values({
                    eventId: event,
                    name: body.name,
                    identity: body.identity,
                    unitName: body.unitName,
                    unitId: body.unitId,
                    email: body.email,
                    phone: body.phone,
                }).returning();

            return status(200, {
                application: APP_NAME,
                message: 'Create new guest data success.',
                data: newGuest,
            });
        }, {
            params: t.Object({
                event: t.String({ format: 'uuid' }),
            }),
            body: TypeBody,
        })
        .guard({
            params: t.Object({
                id: t.Numeric(),
            }),
        }, (app) => app
            .patch('/:id', async ({ params: { id }, body, status }) => {
                await db
                    .update(Guests)
                    .set(body)
                    .where(eq(Guests.id, id));

                return status(200, {
                    application: APP_NAME,
                    message: 'Edit guest data success.',
                });
            }, {
                body: t.Partial(TypeBody),
            })
            .delete('/:id', async ({ params: { id }, status }) => {
                await db
                    .delete(Guests)
                    .where(eq(Guests.id, id));

                return status(200, {
                    application: APP_NAME,
                    message: 'Delete guest data success.',
                });
            }, {
            })
        )
    );
