# node-url-swift-presenter
Node server and extension code for opening a tab in browser with url and change this url every set period.

# How to use
Edit server.config.js to contain correct mongo connection string.

```
npm i
npm start
```

If you changed any setting of server like port or if you would like extension to use remote server,
 go to ``ext/background.js`` and in the first line edit the server variable.
 
Then add extension to the browser manually, use ``chrome://extensions`` ``Add unpacked extesion`` feature.