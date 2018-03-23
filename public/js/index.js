const urlList = document.getElementById("url-list");

fetch('/all').then(d=>d.json()).then(urls=>{
    urls.forEach(addUrlToList);
});

function addUrlToList(url){
    urlList.appendChild(urlToListItem(url));
}

function urlToListItem(url){
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(url));
    return li;
}