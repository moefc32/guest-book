import { IPBIND, PORT } from '$config';
import app from './route';

app.listen({
    hostname: IPBIND,
    port: PORT
});

console.log(
    `${app.config.name} is running at http://${app.server?.hostname}:${app.server?.port}`,
);
