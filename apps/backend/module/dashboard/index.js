import { APP_NAME } from '$config';
import { Elysia, t, NotFoundError } from 'elysia';
import m2mAuth from '$security/m2mAuth';
import { sql, eq, asc, desc, count } from 'drizzle-orm';
import { Guests, Events, Units } from '$db/schema';
import db from '$db/drizzle';

function formatData(data) {
    return data.reduce((acc, row) => {
        acc.labels.push(row.label);
        acc.datasets.push(row.count);

        return acc;
    }, { labels: [], datasets: [] })
}

export default new Elysia({ name: 'dashboard-routes' })
    .group('/:id', {
        params: t.Object({
            id: t.String({ format: 'uuid' }),
        }),
    }, (app) => app
        .use(m2mAuth)
        .get('/', async ({ params: { id }, status }) => {
            const [eventConfig] = await db
                .select({
                    eventId: Events.id,
                    isDatetime: Events.isDatetime,
                    enableForm: Events.enableForm,
                    labelId: Events.labelId,
                    labelUnit: Events.labelUnit,
                })
                .from(Events)
                .where(eq(Events.publicId, id))
                .limit(1);

            if (!eventConfig) throw new NotFoundError();

            const { eventId, ...config } = eventConfig;
            const [bounds, unitCounts, minuteCounts] = await Promise.all([
                db.unionAll(
                    db
                        .select({
                            name: Guests.name,
                            createdAt: Guests.createdAt,
                        })
                        .from(Guests)
                        .where(eq(Guests.eventId, eventId))
                        .orderBy(asc(Guests.createdAt))
                        .limit(1),
                    db
                        .select({
                            name: Guests.name,
                            createdAt: Guests.createdAt,
                        })
                        .from(Guests)
                        .where(eq(Guests.eventId, eventId))
                        .orderBy(desc(Guests.createdAt))
                        .limit(1)
                ).then((rows) => ({
                    firstGuest: rows[0] ?? null,
                    lastGuest: rows[1] ?? rows[0] ?? null
                })),

                db
                    .select({
                        label: sql`COALESCE(${Units.name}, 'Other')`.as('unit_label'),
                        count: count(Guests.id)
                    })
                    .from(Guests)
                    .leftJoin(Units, eq(Guests.unitId, Units.id))
                    .where(eq(Guests.eventId, eventId))
                    .groupBy(sql`unit_label`),

                db
                    .select({
                        label: sql`DATE_FORMAT(${Guests.createdAt}, '%Y-%m-%d %H:%i:00')`.as('minute_window'),
                        count: count(Guests.id)
                    })
                    .from(Guests)
                    .where(eq(Guests.eventId, eventId))
                    .groupBy(sql`minute_window`)
                    .orderBy(asc(sql`minute_window`))
            ]);

            return status(200, {
                application: APP_NAME,
                message: 'Get dashboard data success.',
                data: {
                    config,
                    ...bounds,
                    unitGroup: formatData(unitCounts),
                    timeGroup: formatData(minuteCounts),
                },
            });
        })
    );
