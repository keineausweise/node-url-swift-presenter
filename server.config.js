module.exports = {
    welcomeMessage: "Welcome!",
    port: 8080,
    mode: "mongo", //mongo, file
    mongo: {
        connectionStr: "mongodb://user:password@localhost:27017/dbname"
    },
    client: {
        nextTimeout: 30000
    },
    getNextCacheTime: 1000 * 60 * 10
};