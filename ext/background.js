const server = /*<SERVER>*/`http://localhost:8091`/*</SERVER>*/;

var
    state = {},
    thetab,
    negativeCnt = 0,
    lastSyncTS = 0;



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function stateIsNew(remoteState){
    return (
        state.url !== remoteState.url ||
        state.code !== remoteState.code);
}

function runSync(callback){
    lastSyncTS = Date.now();
    fetch(`${server}/sync/`, {
        headers: {}
    })
        .then(d=>d.json())
        .then(remoteState=>{
            if (stateIsNew(remoteState)){
                state = remoteState;
                updateForState(state);
                negativeCnt = 0;
            } else {
                negativeCnt++;
            }
            callback && setTimeout(()=>callback(), 1);
        })
        .catch(err=>{
            console.error("Error in fetch /sync/", err);
            callback && setTimeout(()=>callback(err), 1);
        });
}

function updateForState(state) {
    chrome.tabs.update(thetab.id, {url: state.url}, tab=>{
        thetab = tab;

        if (state.code && state.code.length > 1){
            setTimeout(()=>{
                chrome.tabs.executeScript(thetab.id, {
                    code: state.code
                }, ()=>{
                    setTimeout(()=>{
                        runSync()
                    }, state.show_for_s*1000);
                })
            }, 300);
        }else{
            setTimeout(()=>{
                runSync()
            }, state.show_for_s*1000);
        }
    });
}


const start = ()=>{
    chrome.tabs.create({}, (tab)=>{
        thetab = tab;
        runSync();
    })
};

function onTabRemoved(tid, info){
    if (!info.isWindowClosing){
        if (thetab && tid === thetab.id){
            start();
        }
    }
}

chrome.tabs.onRemoved.addListener(onTabRemoved);

const CHECK_TIME_DEFAULT = 10000; // 30s
const CHECK_TIME_MINIMUM = 1000; // 2s

function keepChecking(){
    let checkIn = CHECK_TIME_DEFAULT / (negativeCnt||1);
    if (checkIn < CHECK_TIME_MINIMUM) checkIn = CHECK_TIME_MINIMUM;
    setTimeout(()=>{
        runSync(()=>{keepChecking()})
    }, checkIn);
}

start();
keepChecking();


/**WATCHDOG**/
setInterval(()=>{
    if (Date.now() - lastSyncTS < 1000*60*20){ // 20 minutes
        chrome.tabs.onRemoved.removeListener(onTabRemoved);
        chrome.tabs.remove(thetab.id);
        chrome.runtime.reload();
    }
    if (Date.now() - lastSyncTS < 1000*60*10){ // 10 minutes
        keepChecking();
    }
}, 1000*60*10); // once per 10 minutes
