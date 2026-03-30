import { APP_NAME } from '$config';
import { Elysia } from 'elysia';

export default new Elysia({ name: 'default-routes' })
    .get('/', async ({ status }) => {
        return status(200, {
            application: APP_NAME,
            message: 'Application is running.',
        });
    })
    .get('/robots.txt', async ({ set, status }) => {
        set.headers['content-type'] = 'text/plain';

        return status(200,
            `User-agent: *\nDisallow: /`
        );
    });
