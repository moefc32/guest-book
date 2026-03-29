const packageJson = require('./package.json');

function parseSize(size) {
    const match = typeof size === 'string' && size
        .trim()
        .toUpperCase()
        .match(/^(\d+(\.\d+)?)\s*(B|KB|MB|GB)?$/);

    const multipliers = {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
    };

    return match
        ? Math.round(parseFloat(match[1]) * multipliers[match[3] || 'B'])
        : 2097152;
}

module.exports = {
    apps: [
        {
            name: packageJson.name,
            script: 'source/index.ts',
            interpreter: 'bun',
            env: {
                HOST: Bun.env.IPBIND || '127.0.0.1',
                PORT: parseInt(Bun.env.PORT, 10) || 4000,
                BODY_SIZE_LIMIT: parseSize(Bun.env.SIZE_LIMIT),
            },
        },
    ],
};
