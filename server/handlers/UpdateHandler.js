const MoDb = require('../db/MoDb');
const modb = MoDb.instance;

class UpdateHandler{
    async handle(select, update){
        if (select._id){
            select = {_id: select._id}
        }
        if (update._id){
            delete update._id;
        }
        if (update.__v){
            delete update.__v;
        }
        const t = await modb.update(select, update);
        return t;
    }
};

module.exports = UpdateHandler;