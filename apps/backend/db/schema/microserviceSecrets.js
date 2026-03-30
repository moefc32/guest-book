import {
    mysqlTable,
    char,
    serial,
    timestamp,
    varchar,
} from 'drizzle-orm/mysql-core';

export const MicroserviceSecrets = mysqlTable('MicroserviceSecrets', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 16 }).unique().notNull(),
    secret: char('secret', { length: 64 }).unique().notNull(),
    createdAt: timestamp('created_at', { fsp: 3 }).notNull().defaultNow(),
});
