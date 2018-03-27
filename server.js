const express    = require('express');        // call express
const app        = express();                 // define our app using express
const path = require('path');
const http = require('http');
const args = require('args');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth')

args.option("config", "The config of server", "./server.config");

const flags = args.parse(process.argv);

if (flags.help){
    args.showHelp();
    process.exit(0);
}

const settings = require(flags.config);
global.server_settings = settings;
const router = require('./server/router');

app.use(basicAuth({
    users: settings.auth.users
}));
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(bodyParser.json());
app.use(router);

app.all('*', function(req, res, next){
    console.log(req.method, req.url);
    next();
});

const httpServer = http.createServer(app);

httpServer.listen(server_settings.port, function(){console.log("listening: ", server_settings.port);});
console.log(server_settings.welcomeMessage);