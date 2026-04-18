import { DATABASE_URL } from '$config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '$db/schema';

const poolConnection = mysql.createPool({
    uri: DATABASE_URL,
    enableKeepAlive: true,
    connectionLimit: 10,
    dateStrings: true,
});

export default drizzle(poolConnection, { schema, mode: 'default' });

async function shutdown() {
    await poolConnection.end();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
