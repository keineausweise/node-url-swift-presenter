const server = /*<SERVER>*/`http://localhost:8091`/*</SERVER>*/;

var
    state = {},
    thetab,
    negativeCnt = 0;



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function stateIsNew(remoteState){
    return (
        state.url !== remoteState.url ||
        state.code !== remoteState.code);
}

function runSync(callback){
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
        }
    );
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

chrome.tabs.onRemoved.addListener((tid, info)=>{
    if (!info.isWindowClosing){
        if (thetab && tid === thetab.id){
            start();
        }
    }
});

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
