import { inputNewCredentials, print } from './cli';
import { checkUsers, createAdminCredentials, registerServices } from './db';
import { generateServiceSecrets } from './crypto';

// Maximum 16 characters long per service name
const REQUIRED_SERVICES = [
    'frontend',
];

async function setup() {
    print.header('\n--[ SYSTEM PROVISIONING ]-----');

    try {
        // 1. Admin credentials
        const isUserExist = await checkUsers();
        const { email, password } = await inputNewCredentials(isUserExist);

        // 2. Generate M2M service key(s)
        const serviceResults = generateServiceSecrets(REQUIRED_SERVICES);
        const isPluralService = serviceResults.length > 1;

        // 3. Database transaction
        print.text('\nWriting configurations to database...');

        if (email && password) await createAdminCredentials(email, password);
        await registerServices(serviceResults);

        // 4. Final output for DX
        print.success('\nSystem provisioning successful.\n');

        print.header('--[ SERVICE KEYS ]------------');
        print.text(isPluralService
            ? 'Store these values in their respective .env files :'
            : 'Store this value in its respective .env file :'
        );

        serviceResults.forEach((service) => {
            console.log(`${service.name.padEnd(16)}: ${service.secret}`);
        });
        print.warn(isPluralService
            ? '\nNote: Treat these secret keys like passwords. Never share or commit them to version control.\n'
            : '\nNote: Treat this secret key like a password. Never share or commit it to version control.\n'
        );
    } catch (e) {
        print.error(e.message);
        process.exit(1);
    }

    process.exit(0);
}

setup();
