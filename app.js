'use strict';
// Module Dependencies
// -------------------
var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var http = require('http');
var path = require('path');
var request = require('request');
var routes = require('./routes');
var activity = require('./routes/activity');
const JWT = require(path.join(__dirname, 'lib', 'jwtDecoder.js'));
const axios = require('axios');

var app = express();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({ type: 'application/jwt' }));
app.use(bodyParser.urlencoded({ extended: true }));



//app.use(express.methodOverride());
//app.use(express.favicon());


// // Simple custom middleware
// function tokenFromJWT(err, req, res, next) {
//     if (err) {
//         res.status(404).send('Unauthorized')
//     }
//     // Setup the signature for decoding the JWT
//     var jwt = new JWT({ appSignature: process.env.jwtSecret });

//     // Object representing the data in the JWT
//     var jwtData = jwt.decode(req);

//     // Bolt the data we need to make this call onto the session.
//     req.session.token = jwtData.token;
//     next();
// }




// Express in Development Mode
if ('development' == app.get('env')) {
    app.use(errorhandler());
}



// HubExchange Routes
app.use('/', routes.index);
app.use('/authorize', routes.authorize);
app.post('/login', routes.login);
app.post('/logout', routes.logout);


// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save);
app.post('/journeybuilder/validate/', activity.validate);
app.post('/journeybuilder/publish/', activity.publish);
app.post('/journeybuilder/execute/', activity.execute);
app.post('/journeybuilder/getattributegroup/', activity.getattributegroup);
app.post('/journeybuilder/getLoggingSchema/', activity.getLoggingSchema);

app.use(express.static(path.join(__dirname, 'public')));


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});