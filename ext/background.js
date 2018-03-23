const server = /*<SERVER>*/`http://localhost:8080`/*</SERVER>*/;


var current = "https://facebook.com",
    config, Tab, interval;

const start = ()=>{chrome.tabs.create({}, (tab)=>{
    init(tab);
})};
start();
chrome.tabs.onRemoved.addListener((tid, info)=>{
    if (!info.isWindowClosing){
        start();
    }
});

function init(tab){
    Tab = tab;
    clearInterval(interval);
    fetch(`${server}/config`).then(d=>d.json()).then(conf=>{
        config = conf;
        callNext().then(()=>{
            interval = setInterval(()=>{
                callNext();
            }, config.nextTimeout);
        });
    });
}

function callNext(){
    return next();
}

function next(){
    const fetchUrl = `${server}/next/${encodeURIComponent(current)}`;
    return fetch(fetchUrl).then(d=>d.json()).then(d=>{
        chrome.tabs.update(Tab.id, {url: d.url}, t=>{
            current = d.url;
            console.log("Updated");
            if (d.code){
                chrome.tabs.executeScript(Tab.id, {code: d.code}, r=>{
                    console.log(`Script executed, result: ${r}`);
                });
            }
        });
        return d;
    });
}