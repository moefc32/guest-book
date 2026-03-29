import bcrypt from 'bcrypt';

export default {
    hash: async (password) => {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(password, salt);
    },
    compare: async (password, hashedPassword) => {
        return await bcrypt.compare(password, hashedPassword);
    },
};
