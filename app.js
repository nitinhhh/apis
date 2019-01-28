/**
 * Module dependencies.
 */
const configuration = require('./config/config');

//------------Mongo Connection ------------//
require('./resources/db');

// Importing other modules
const express = require('express'),
    bodyParser = require('body-parser'),
    http = require('http'),
    app = express(),
    methodOverride = require('method-override'),
    router = express.Router(),
    resp = require('./lib/responseHandler');

app.set('port', process.env.PORT || configuration.defaultPort);

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ type: 'text/plain', limit: '50mb' }));
app.use(bodyParser.json({ type: 'application/json', limit: '50mb' }));
app.use(methodOverride());
app.use(resp.bodyParserHandle);

require('./routes/apiRoutes') (app, router);

//404
app.get('*', (req, res, next) => {
    resp.responseWithError(req, res, {status: 404, message: `Invalid path at ${req.path}`})
});
//405
app.all('*', (req, res, next) => {
    resp.responseWithError(req, res, {status: 405, message: `${req.method} method is not allowed at ${req.path}.`});
});
app.use(resp.errorHandler);

const server = http.createServer(app);
server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
});
server.setTimeout(500000);
module.exports = server;