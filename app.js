'use strict';
// Module Dependencies
// -------------------
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const cookieParser = require("cookie-parser");
var cookieSession = require('cookie-session')
const errorhandler = require('errorhandler');
const http = require('http');
const path = require('path');
const request = require('request');
var cookies = require('cookies');
const JWT = require(path.join(__dirname, 'lib', 'jwtDecoder.js'));
const axios = require('axios');
var cors = require('cors')

var app = express();
app.use(cookieParser())

// Configure Express

app.set('port', process.env.PORT || 3000);
app.set('trust proxy', 1) // trust first proxy
app.use(bodyParser.raw({ type: 'application/jwt' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
    // enable pre-flight request for loggingSchema request
app.options('/journeybuilder/getLoggingSchema/', cors())

//app.use(express.methodOverride());
//app.use(express.favicon());

//load routes
const routes = require('./routes');
const activity = require('./routes/activity');
const middleware = require('./routes/middleware');


async function cookieValidator(cookies) {
    try {
        return cookies.jbLoggerSession
    } catch {
        throw new Error('Invalid cookies')
    }
}

async function validateCookies(req, res, next) {
    await cookieValidator(req.cookies)
    next()
}

//use routes/middleware
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(validateCookies)


app.use('/', middleware.authorize);
app.use('/', express.static(path.join(__dirname, 'views')))


// Express in Development Mode
if ('development' == app.get('env')) {
    app.use(errorhandler());
}

app.post('/login', routes.login);
app.post('/logout', routes.logout);


// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save);
app.post('/journeybuilder/validate/', activity.validate);
app.post('/journeybuilder/publish/', activity.publish);
app.post('/journeybuilder/execute/', activity.execute);
app.post('/journeybuilder/getattributegroup/', activity.getattributegroup);
app.post('/journeybuilder/getLoggingSchema/', cors(), activity.getLoggingSchema);

// error handler
app.use(function(err, req, res, next) {
    res.status(400).send(err.message)
})


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});