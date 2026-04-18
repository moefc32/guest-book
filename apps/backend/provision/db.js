import { eq, sql } from 'drizzle-orm';
import { MicroserviceSecrets, Users } from '$db/schema';
import db from '$db/drizzle';
import auth from '$source/auth';
import { print } from './cli';

export async function checkUsers() {
    try {
        const [isUserExist] = await db.select()
            .from(Users).limit(1);

        return !!isUserExist;
    } catch (e) {
        throw e;
    }
}

export async function createAdminCredentials(email, password) {
    try {
        const [existing] = await db
            .select({ id: Users.id })
            .from(Users)
            .where(eq(Users.email, email))
            .limit(1);

        if (existing) {
            print.warn('\nWarning: same credential already exists, skipping account creation.');
            return;
        }

        await auth.api.createUser({
            body: {
                name: 'Administrator',
                email,
                password,
            }
        });
    } catch (e) {
        throw e;
    }
}

export async function registerServices(services) {
    try {
        await db.transaction(async (tx) => {
            for (const service of services) {
                await tx
                    .insert(MicroserviceSecrets)
                    .values({
                        name: service.name,
                        secret: service.secret
                    })
                    .onDuplicateKeyUpdate({
                        set: {
                            secret: sql`VALUES(secret)`,
                        },
                    });
            }
        });
    } catch (e) {
        throw e;
    }
}
