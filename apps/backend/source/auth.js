import {
    APP_NAME,
    AUTH_URL,
    JWT_SECRET,
    JWT_ACCESS_EXPIRATION,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    CAPTCHA_PROVIDER,
    CAPTCHA_SECRET,
} from '$config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, captcha, jwt } from 'better-auth/plugins';
import { db } from '$db/drizzle';

export default betterAuth({
    appName: APP_NAME,
    baseURL: AUTH_URL,
    basePath: '/auth',
    secret: JWT_SECRET,
    database: drizzleAdapter(db, {
        provider: 'mysql',
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: false,
        minPasswordLength: 12,
        maxPasswordLength: 100,
        autoSignIn: true,
    },
    socialProviders: {
        github: {
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
        },
        google: {
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        },
    },
    plugins: [
        admin(),
        captcha({
            provider: CAPTCHA_PROVIDER,
            secretKey: CAPTCHA_SECRET,
        }),
        jwt({
            jwt: {
                expirationTime: JWT_ACCESS_EXPIRATION,
                definePayload: ({ user }) => {
                    return { id: user.id }
                }
            }
        }),
    ],
    user: {
        modelName: 'Users',
    },
    session: {
        modelName: 'Sessions',
    },
    account: {
        modelName: 'Accounts',
        accountLinking: {
            enabled: true,
            trustedProviders: ['email-password', 'google', 'github'],
            allowDifferentEmails: false,
        }
    },
    verification: {
        modelName: 'Verifications',
    },
    jwks: {
        modelName: 'JWKS',
    },
    advanced: {
        database: {
            generateId: () => {
                return crypto.randomUUID();
            },
        },
    },
});
