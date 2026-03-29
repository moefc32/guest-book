import { DATABASE_URL } from '$config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '$db/schema';

const connection = await mysql.createConnection(DATABASE_URL);

export const db = drizzle(connection, { schema, mode: 'default' });
