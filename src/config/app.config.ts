export const EnvConfiguration = () => ({
    environment: process.env.NODE_ENV || 'dev',
    mongodb : process.env.MONGODB || 'mongodb://localhost:27017/defaultdb',
    port: process.env.PORT || 3001,
    defaultLimit: process.env.DEFAULT_LIMIT || 7,
    defaultOffset: process.env.DEFAULT_OFFSET || 1
});