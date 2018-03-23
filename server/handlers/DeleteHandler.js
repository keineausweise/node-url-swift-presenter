const MoDb = require('../db/MoDb');
const modb = MoDb.instance;

class DeleteHandler{
    async handle(id){
        const t = await modb.removeById(id);
        return t;
    }
};

module.exports = DeleteHandler;