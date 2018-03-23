const iframe = document.querySelector("iframe");

fetch('/config').then(d=>d.json()).then(json=>{
    init(json);
});

var current = "https://facebook.com",
    config;

function init(conf){
    config = conf;
    callNext().then(()=>{
        setInterval(()=>{
            callNext();
        }, config.nextTimeout);
    });
}

function callNext(){
    return next();
}

function next(){
    const fetchUrl = `/next/${encodeURIComponent(current)}`;
    return fetch(fetchUrl).then(d=>d.json()).then(d=>{
        iframe.setAttribute('src', d.url);
        current = d.url;
        return d;
    });
}