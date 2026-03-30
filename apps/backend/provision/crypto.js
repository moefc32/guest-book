import { randomBytes } from 'node:crypto';

export function generateServiceSecrets(serviceNames) {
    const serviceResults = [];

    for (const name of serviceNames) {
        serviceResults.push({
            name,
            secret: randomBytes(32).toString('hex'),
        });
    }

    return serviceResults;
}
