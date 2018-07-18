module.exports = {
    welcomeMessage: "Welcome!",
    port: 8081,
    mode: "mongo", //mongo, file
    mongo: {
        connectionStr: "mongodb://localhost:27017/url-swift"
    },
    client: {
        nextTimeout: 60000 * 4
    },
    getNextCacheTime: 1000 * 60 * 10,
    syncCacheTime: 1000 * 60 * 3
};