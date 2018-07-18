const MoDb = require('../db/MoDb');
const modb = MoDb.instance;

const cache = {
    lastUpdate: 0,
    data: []
};

const CACHE_UPDATE_TIMEOUT = global.server_settings.syncCacheTime;

class SyncHandler{
    constructor(){
        this.current = null;
        this.currentStartAt = null;
    }

    currentTimeIsUp(){
        if (!this.current) return true;
        return ( ( (this.current.show_for_s * 1000) + this.currentStartAt ) - Date.now() ) > 0;
    }

    async handle(){
        if (this.currentTimeIsUp()){
            const nextCurrent = await this._getNextCurrent();
            this.current = nextCurrent;
            this.currentStartAt = Date.now();
        }
        return this.current;
    }

    async _getNextCurrent(){
        if (Date.now() - cache.lastUpdate > CACHE_UPDATE_TIMEOUT){
            cache.data = await modb.getAllEnabledUrls();
        }

        const currentIndex = (()=>{
            if (!this.current) return -1;
            for (let i=0; i<cache.data.length; i++){
                if (cache.data[i].url === this.current.url){
                    return i;
                }
            }
            return -1;
        })();

        let indexToSelect;
        switch (currentIndex){
            case -1:
            case cache.data.length -1:
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
            code: ret.code,
            show_for_s: ret.show_for_s
        }
    }
}

module.exports = SyncHandler;