import { relations } from 'drizzle-orm';
import {
    mysqlTable,
    boolean,
    index,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/mysql-core';

export const Users = mysqlTable(
    'Users',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        name: varchar('name', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }).notNull().unique(),
        emailVerified: boolean('email_verified').default(false).notNull(),
        image: text('image'),
        createdAt: timestamp('created_at', { fsp: 3 }).notNull(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .$onUpdate(() => new Date())
            .notNull(),
        role: text('role'),
        banned: boolean('banned').default(false),
        banReason: text('ban_reason'),
        banExpires: timestamp('ban_expires', { fsp: 3 }),
    },
);

export const Sessions = mysqlTable(
    'Sessions',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        expiresAt: timestamp('expires_at', { fsp: 3 }).notNull(),
        token: varchar('token', { length: 255 }).notNull().unique(),
        createdAt: timestamp('created_at', { fsp: 3 }).notNull(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => Users.id, { onDelete: 'cascade' }),
        impersonatedBy: text('impersonated_by'),
    },
    (table) => [index('Sessions_userId_idx').on(table.userId)],
);

export const Accounts = mysqlTable(
    'Accounts',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        accountId: text('account_id').notNull(),
        providerId: text('provider_id').notNull(),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => Users.id, { onDelete: 'cascade' }),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        idToken: text('id_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at', { fsp: 3 }),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { fsp: 3 }),
        scope: text('scope'),
        password: text('password'),
        createdAt: timestamp('created_at', { fsp: 3 }).notNull(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index('Accounts_userId_idx').on(table.userId)],
);

export const Verifications = mysqlTable(
    'Verifications',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        identifier: varchar('identifier', { length: 255 }).notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at', { fsp: 3 }).notNull(),
        createdAt: timestamp('created_at', { fsp: 3 }).notNull(),
        updatedAt: timestamp('updated_at', { fsp: 3 })
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index('Verifications_identifier_idx').on(table.identifier)],
);

export const JWKS = mysqlTable(
    'JWKS',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        publicKey: text('public_key').notNull(),
        privateKey: text('private_key').notNull(),
        createdAt: timestamp('created_at', { fsp: 3 }).notNull(),
        expiresAt: timestamp('expires_at', { fsp: 3 }),
    },
);

export const UsersRelations = relations(Users, ({ many }) => ({
    sessions: many(Sessions),
    accounts: many(Accounts),
}));

export const SessionsRelations = relations(Sessions, ({ one }) => ({
    Users: one(Users, {
        fields: [Sessions.userId],
        references: [Users.id],
    }),
}));

export const AccountsRelations = relations(Accounts, ({ one }) => ({
    Users: one(Users, {
        fields: [Accounts.userId],
        references: [Users.id],
    }),
}));
