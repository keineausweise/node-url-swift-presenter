const mongoose = require("mongoose");
const UrlScheme = require("./UrlScheme");

let instance;

class MoDb{
    constructor(){
        const settings   = global.server_settings;
        const connectionStr = settings.mongo.connectionStr;
        this._connection = mongoose.createConnection(connectionStr);
        console.log("New connection", connectionStr);
        this._UrlModel   = this._connection.model("swift_urls", UrlScheme);
    }

    static get instance() {return instance;}

    getAllUrls(){
        return new Promise((resolve, reject) => {
            this._UrlModel.find()
                .sort('order')
                .exec(function(err, tasks){
                    if (err) {return reject(err);}
                    resolve(tasks);
                });
        })
    }

    getAllEnabledUrls(){
        return new Promise((resolve, reject) => {
            this._UrlModel.find()
                .where('enabled').ne(false)
                .sort('order')
                .exec(function(err, tasks){
                    if (err) {return reject(err);}
                    resolve(tasks);
                });
        })
    }

    insertUrl(fields){
        return new Promise((resolve, reject) => {
            this._UrlModel.create(fields, (err, t)=>{
                if (err){
                    reject(err);
                }else{
                    resolve(t);
                }
            });
        })
    }

    remove(select){
        return new Promise((resolve, reject)=>{
            this._UrlModel.remove(select, err=>{
                if (err) return reject(err);
                resolve();
            });
        });
    }

    removeById(id){
        console.log('removeById', id);
        return new Promise((resolve, reject) => {
            this._UrlModel.findByIdAndRemove(id, err=>{
                if (err) return reject(err);
                resolve();
            });
        });
    }

    update(select, update){
        return new Promise((resolve, reject)=>{
            this._UrlModel.update(select, {$set: update}, err=> {
                if (err) return reject(err);
                resolve();
            })
        });
    }
}

instance = new MoDb();

module.exports = MoDb;