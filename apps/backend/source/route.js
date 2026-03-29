import { APP_NAME } from '$config';
import { Elysia } from 'elysia';
import route from './elysia';
import auth from './auth';

import defaultRoutes from '$module/default';
import microserviceRoutes from '$module/microservice';

// Modular routes start here

route
    .use(defaultRoutes)
    .use(new Elysia({ prefix: '/microservice' }).use(microserviceRoutes))
    .all('/auth/*', (ctx) => auth.handler(ctx.request))
    .onError(({ code, error, status }) => {
        console.error(`[${code}] ${error.message}`);
        console.error(error.stack);

        if (code === 'PARSE') {
            return status(400, {
                application: APP_NAME,
                message: 'Malformed request body!',
            });
        }

        if (code === 'UNAUTHORIZED') {
            return status(401, {
                application: APP_NAME,
                message: 'Service verification failed!',
            });
        }

        if (code === 'NOT_FOUND') {
            return status(404, {
                application: APP_NAME,
                message: 'Route or resource not found!',
            });
        }

        if (code === 'INVALID_FILE_TYPE') {
            return status(415, {
                application: APP_NAME,
                message: 'Unsupported file format!',
            });
        }

        if (code === 'VALIDATION') {
            return status(422, {
                application: APP_NAME,
                message: 'Invalid request data provided!',
            });
        }

        return status(500, {
            application: APP_NAME,
            message: 'Unexpected server error occurred!',
        });
    });

// End of routes

export default route;
