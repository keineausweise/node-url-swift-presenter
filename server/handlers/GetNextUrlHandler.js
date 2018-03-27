const MoDb = require('../db/MoDb');
const modb = MoDb.instance;

const cache = {
    lastUpdate: 0,
    data: []
};

const CACHE_UPDATE_TIMEOUT = global.server_settings.getNextCacheTime;

class GetNextUrlHandler{
    async handle(current){
        if (Date.now() - cache.lastUpdate > CACHE_UPDATE_TIMEOUT){
            cache.data = await modb.getAllEnabledUrls();
            console.log("Updated cache", cache.data);
        }

        const currentIndex = (()=>{
            for (let i=0; i<cache.data.length; i++){
                if (cache.data[i].url === current){
                    return i;
                }
            }
            return -1;
        })();

        let indexToSelect;
        switch (currentIndex){
            case -1:
                indexToSelect = 0;
                break;
            default:
                indexToSelect = currentIndex + 1;
                if (indexToSelect >= cache.data.length){
                    indexToSelect = 0;
                }
                break;
        }

        const ret = cache.data[indexToSelect];
        return {
            url: ret.url,
            code: ret.code
        }
    }
};

module.exports = GetNextUrlHandler;