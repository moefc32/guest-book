import {
    boolean,
    int,
    mysqlTable,
    varchar,
} from 'drizzle-orm/mysql-core';

export const Configs = mysqlTable('Configs', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }),
    place: varchar('place', { length: 250 }),
    organizer: varchar('organizer', { length: 100 }),
    chief: varchar('chief', { length: 100 }),
    isLogoProvided: boolean('logo').default(false),
    labelId: varchar('label_id', { length: 30 }),
    labelUnit: varchar('label_unit', { length: 30 }),
});
