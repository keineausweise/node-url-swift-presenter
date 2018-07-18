const express = require('express');
const router  = express.Router();
const GetAllHandler = new (require('./handlers/GetAllHandler'))();
const AddUrlHandler = new (require('./handlers/AddUrlHandler'))();
const GetNextUrlHandler = new (require('./handlers/GetNextUrlHandler'))();
const DeleteHandler = new (require('./handlers/DeleteHandler'))();
const UpdateHandler = new (require('./handlers/UpdateHandler'))();
const SyncHandler = new (require('./handlers/SyncHandler'))();


router.get('/status', (req, res) => {
    res.json({status: 'running'})
});

router.get('/config', (req, res)=>{
    res.json(global.server_settings.client);
});

router.get('/all', (req, res) => {
    GetAllHandler.handle().then(urls=>{
        res.json(urls.map(o=>o.url));
    }).catch(err=>{
        res.status(500).json({
            errStr: err.toString(),
            result: "Can't get all from db."
        });
    })
});

router.get('/all/detailed', (req, res) => {
    GetAllHandler.handle().then(urls=>{
        res.json(urls);
    }).catch(err=>{
        res.status(500).json({
            errStr: err.toString(),
            result: "Can't get all from db."
        });
    })
});

router.get('/sync/', (req, res) => {
    SyncHandler.handle().then(current=>{
        res.send(JSON.stringify(current));
    }, err => {
        console.error(err);
        res.status(500).json({
            errStr: err.toString(),
            result: "Can't sync"
        }).catch(err => {
            console.error(err);
            res.status(500).json({
                errStr: err.toString(),
                result: "Can't get next url",
                catch:  true
            })
        });
    })
});

router.get('/next/:current', (req, res)=>{
    const current = decodeURIComponent(req.params.current);
    GetNextUrlHandler.handle(current)
        .then(u=>{
            res.json(u);
        })
        .catch(err => {
            res.status(500).json({
                errStr: err.toString(),
                result: "Can't get next url"
            });
        })
});

router.put('/url', (req, res) => {
    if (req.header("Content-Type") !== "application/json"){
        res.status(400).json({
            message: "Content-Type application/json expected."
        });
        return;
    }
    AddUrlHandler.handle(req.body)
        .then(t=>{
            res.json({t});
        })
        .catch(err=>{
            res.status(500).json({
                errStr: err.toString(),
                result: "Couldn't add."
            });
        });
});

router.delete('/id/:id', (req, res)=>{
    const id = req.params.id;
    if (!id){
        res.status(400).json({
            message: "Id expected."
        });
        return;
    }
    DeleteHandler.handle(id)
        .then(()=>{res.json({deleted: id});})
        .catch(err=>{
        res.status(500).json({
            errStr: err.toString(),
            result: "Couldn't delete."
        });
    });
});

router.post('/update', (req, res)=>{
    if (req.header("Content-Type") !== "application/json"){
        res.status(400).json({
            message: "Content-Type application/json expected."
        });
        return;
    }

    const select = req.body.select,
          update = req.body.update;

    if (!select){
        res.status(400).json({
            message: "Expect select condition"
        });
        return;
    }

    if (!update){
        res.status(400).json({
            message: "Expect update value"
        });
        return;
    }

    UpdateHandler.handle(select, update)
        .then(()=>{
            res.json({status: "ok"});
        })
        .catch(err=>{
            res.status(500).json({
                errStr: err.toString(),
                result: "Couldn't update."
            });
        })
});

module.exports = router;
