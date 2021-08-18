'use strict';
// Module Dependencies
// -------------------
const express = require('express');

const http = require('http');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const request = require('request');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const cookieParser = require("cookie-parser");
const JWT = require(path.join(__dirname, 'lib', 'jwtDecoder.js'));

//load routes
const routes = require('./routes');
const activity = require('./routes/activity');
const middleware = require('./routes/middleware');

// Configure Express
var app = express();
app.set('port', process.env.PORT || 3000);

app.use(cors())
app.use(cookieParser())
app.use(bodyParser.raw({ type: 'application/jwt' }));
app.use(bodyParser.urlencoded({ extended: true }));

//use routes/middleware
app.use(express.static(path.join(__dirname, 'public')))
app.use('/views', middleware.authorize, express.static(path.join(__dirname, 'views')))

// Express in Development Mode
if ('development' == app.get('env')) {
    app.use(errorhandler());
}

// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save);
app.post('/journeybuilder/validate/', activity.validate);
app.post('/journeybuilder/publish/', activity.publish);
app.post('/journeybuilder/execute/', activity.execute);
app.post('/journeybuilder/getLoggingSchema/', activity.getLoggingSchema);


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});