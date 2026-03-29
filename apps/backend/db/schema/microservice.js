import {
    mysqlTable,
    char,
    index,
    serial,
    timestamp,
    varchar,
} from 'drizzle-orm/mysql-core';

export const MicroserviceKeys = mysqlTable(
    'MicroserviceKeys',
    {
        id: serial('id').primaryKey(),
        name: varchar('name', { length: 16 }).unique().notNull(),
        hash: char('hash', { length: 64 }).unique().notNull(),
        createdAt: timestamp('created_at', { fsp: 3 }).notNull().defaultNow(),
    },
    (table) => [index('MicroserviceKeys_name_idx').on(table.name)],
);
