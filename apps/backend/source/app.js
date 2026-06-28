import { IPBIND, PORT } from '$config';
import fs from 'node:fs/promises';
import path from 'node:path';
import app from './route';

const publicDirectory = path.join(process.cwd(), 'public');
await fs.mkdir(publicDirectory, { recursive: true });

app.listen({
    hostname: IPBIND,
    port: PORT
});

console.log(
    `${app.config.name} is running at http://${app.server?.hostname}:${app.server?.port}`,
);
