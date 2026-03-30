import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import m2mAuth from '$security/m2mAuth';

export default new Elysia({ name: 'static-routes' })
    .use(m2mAuth)
    .use(staticPlugin({
        prefix: '/',
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    }));
