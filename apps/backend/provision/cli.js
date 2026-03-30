function c(color, text) {
    const colors = {
        reset: '\x1b[0m',
        header: '\x1b[38;2;78;201;176m',
        label: '\x1b[38;2;156;220;254m',
        text: '\x1b[38;2;170;178;186m',
        success: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
    };

    return `${colors[color]}${text}${colors.reset}`;
}

function userInputText(promptText, hideInput = false, defaultValue = '') {
    return new Promise((resolve) => {
        process.stdout.write(c('label', promptText + ' ') + (defaultValue ?? ''));

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        let input = defaultValue;
        let cursor = defaultValue?.length || 0;

        function render() {
            process.stdout.write('\r\x1b[2K');

            const display = hideInput
                ? '*'.repeat(input.length)
                : input;

            const line = c('label', promptText) + ' ' + display;

            process.stdout.write(line);

            // Move cursor when needed
            const offset = display.length - cursor;
            if (offset > 0) {
                process.stdout.write(`\x1b[${offset}D`);
            }
        }

        function onData(key) {
            // Enter
            if (key === '\r') {
                process.stdout.write('\n');
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeListener('data', onData);

                resolve(input);
                return;
            }

            // Ctrl + C
            if (key === '\u0003') {
                process.exit(1);
            }

            // Left
            if (key === '\x1b[D') {
                if (cursor > 0) cursor--;
                return render();
            }

            // Right
            if (key === '\x1b[C') {
                if (cursor < input.length) cursor++;
                return render();
            }

            // Ignore other escape sequences
            if (key.startsWith('\x1b')) return;

            // Backspace
            if (key === '\x7f') {
                if (cursor > 0) {
                    input = input.slice(0, cursor - 1) + input.slice(cursor);
                    cursor--;
                }

                return render();
            }

            // Printable characters
            if (key >= ' ' && key <= '~') {
                input = input.slice(0, cursor) + key + input.slice(cursor);
                cursor++;

                return render();
            }
        };

        process.stdin.on('data', onData);
    });
}

function userInputBoolean(promptText, defaultValue = false) {
    return new Promise((resolve) => {
        const suffix = defaultValue ? ' (Y/n) ' : ' (y/N) ';
        process.stdout.write(c('label', promptText + suffix));

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        function cleanup() {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener('data', onData);
        }

        const onData = (key) => {
            // Enter → use default
            if (key === '\r') {
                process.stdout.write('\n');
                cleanup();

                resolve(defaultValue);
                return;
            }

            // Ctrl + C
            if (key === '\u0003') {
                process.exit(1);
            }

            if (key.toLowerCase() === 'y') {
                process.stdout.write('y\n');
                cleanup();

                resolve(true);
                return;
            }

            if (key.toLowerCase() === 'n') {
                process.stdout.write('n\n');
                cleanup();

                resolve(false);
                return;
            }
        };

        process.stdin.on('data', onData);
    });
}

export const print = {
    header: (message) => {
        console.log(c('header', message));
    },
    text: (message) => {
        console.log(c('text', message));
    },
    success: (message) => {
        console.log(c('success', message));
    },
    warn: (message) => {
        console.log(c('warn', message));
    },
    error: (message) => {
        console.error(c('error', message));
    },
};

export async function inputNewCredentials(isUserExist) {
    let email = '';
    let password = '';
    let proceed = false;

    if (isUserExist) {
        print.text('\nAdministrator account may already exist.');
        proceed = await userInputBoolean('Do you want to create new account?');
    }

    if (isUserExist && !proceed) return { email, password };

    function checkEmail() {
        const trimmedEmail = email.trim().replace(/\n+$/, '');
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    }

    print.text('\nPlease provide new administrator credentials.');

    while (!email || !password || !checkEmail()) {
        email = (await userInputText('Set e-mail  :', false, email)).trim();
        password = (await userInputText('Set password:', true)).trim();

        if (!email || !password || !checkEmail()) {
            print.error('\nValid admin credentials must be given!\n');
        }
    }

    return {
        email,
        password,
    }
}
