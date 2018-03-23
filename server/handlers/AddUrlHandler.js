const MoDb = require('../db/MoDb');
const modb = MoDb.instance;

class AddUrlHandler{
    async handle(fields){
        const t = await modb.insertUrl(fields);
        return t;
    }
};

module.exports = AddUrlHandler;