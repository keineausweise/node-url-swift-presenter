const MoDb = require('../db/MoDb');
const modb = MoDb.instance;

class GetAllHandler{
    async handle(){
        const urls = await modb.getAllUrls();
        return urls;
    }
};

module.exports = GetAllHandler;