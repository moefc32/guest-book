import { APP_NAME } from '$config';
import { Elysia } from 'elysia';
import m2mAuth from '$security/m2mAuth';

export default new Elysia({ name: 'default-routes' })
    .group('/guard', (app) => app
        .use(m2mAuth)
        .get('/', ({ status }) => {
            return status(200, {
                application: APP_NAME,
                message: 'Ok.',
            });
        })
    )
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
