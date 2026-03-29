import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'mysql',
    schema: './db/schema/*',
    out: './db/migration',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
