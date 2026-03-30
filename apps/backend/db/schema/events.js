import { relations } from 'drizzle-orm';
import {
    mysqlTable,
    boolean,
    char,
    index,
    int,
    timestamp,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/mysql-core';

export const Events = mysqlTable('Events', {
    id: int('id').autoincrement().primaryKey(),
    publicId: char('public_id', { length: 36 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    place: varchar('place', { length: 250 }).notNull(),
    organizer: varchar('organizer', { length: 100 }).notNull(),
    chief: varchar('chief', { length: 100 }).notNull(),
    isLogoProvided: boolean('logo').default(false),
    isDatetime: boolean('is_datetime').notNull().default(false),
    enableForm: boolean('enable_forms').notNull().default(true),
    labelId: varchar('label_id', { length: 30 }),
    labelUnit: varchar('label_unit', { length: 30 }),
}, (table) => ({
    publicIdIdx: uniqueIndex('events_public_id_idx')
        .on(table.publicId),
}));

export const Units = mysqlTable('Units', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    sortOrder: int('sort_order').notNull(),
}, (table) => ({
    nameIdx: uniqueIndex('units_name_idx').on(table.name),
    sortOrderIdx: index('units_sort_order_idx').on(table.sortOrder),
}));

export const Guests = mysqlTable('Guests', {
    id: int('id').autoincrement().primaryKey(),
    eventId: int('event_id').notNull().references(() => Events.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 50 }).notNull(),
    identity: varchar('identity', { length: 20 }),
    unitId: int('unit_id').references(() => Units.id, { onDelete: 'set null' }),
    unitName: varchar('unit_name', { length: 100 }),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    createdAt: timestamp('created_at', { fsp: 3 }).notNull().defaultNow(),
}, (table) => ({
    eventUnitIdx: index('guests_event_unit_idx')
        .on(table.eventId, table.unitId),
    eventCreatedIdx: index('guests_event_created_idx')
        .on(table.eventId, table.createdAt),
}));

export const EventsRelations = relations(Events, ({ many }) => ({
    guests: many(Guests),
}));

export const UnitsRelations = relations(Units, ({ many }) => ({
    guests: many(Guests),
}));

export const GuestsRelations = relations(Guests, ({ one }) => ({
    Events: one(Events, {
        fields: [Guests.eventId],
        references: [Events.id],
    }),
    Units: one(Units, {
        fields: [Guests.unitId],
        references: [Units.id],
    }),
}));
