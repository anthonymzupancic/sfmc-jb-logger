'use strict';
// Module Dependencies
// -------------------
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const cookieParser = require("cookie-parser");
var errorhandler = require('errorhandler');
var http = require('http');
var path = require('path');
var request = require('request');
var routes = require('./routes');
var activity = require('./routes/activity');
const JWT = require(path.join(__dirname, 'lib', 'jwtDecoder.js'));
const axios = require('axios');
const { query } = require('express');
var cookieParser = require('cookie-parser')
var app = express();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({ type: 'application/jwt' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser('testSecret-jb-logger'));

//app.use(express.methodOverride());
//app.use(express.favicon());
app.use((req, res, next) => {
    console.log(req.cookies)
    next()
})

app.use((req, res, next) => {
    if (!req.sessionID) {
        if (req.query.code) {
            next()
        } else {
            let redirectURI = 'https%3A%2F%2Ftwilio-integration-dev.herokuapp.com';
            const authBase = 'https://mc1q10jrzwsds3bcgk0jjz2s8h80.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id='
            res.redirect(`${authBase}${process.env.sfmcAuthClientID}&redirect_uri=${redirectURI}`)
        }
    } else {
        next()
    }

})

app.use((req, res, next) => {
    if (!req.sessionID) {
        try {
            const code = req.query.code

            if (code) {
                const config = {
                    url: 'https://mc1q10jrzwsds3bcgk0jjz2s8h80.auth.marketingcloudapis.com/v2/token',
                    options: {
                        "grant_type": "authorization_code",
                        "code": code,
                        "client_id": process.env.sfmcAuthClientID,
                        "client_secret": process.env.sfmcAuthClientSecret,
                        "redirect_uri": "https://twilio-integration-dev.herokuapp.com"
                    }
                }

                axios.post(config.url, config.options)
                    .then((res) => {
                        if (!res.data.access_token) {
                            res.send('Unauthorized')
                        } else {
                            console.log('Access Token Found')
                            console.log(res.data.access_token)
                            next()
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        res.send(err)
                    })

            } else {
                res.send('Unautorized: no code provided.')
            }
        } catch (err) {
            console.log(err)
        }
    } else {
        next()
    }
})


app.set('trust proxy', 1) // trust first proxy
app.use(session({
    name: 'sfmc-jb-logger',
    secret: 'testSecret-jb-logger',
    maxAge: 6000 * 1,
    resave: false,
    saveUninitialized: false,
    sameSite: 'strict',
    cookie: { secure: true }
}))

app.use(express.static(path.join(__dirname, 'public')))

// Express in Development Mode
if ('development' == app.get('env')) {
    app.use(errorhandler());
}

// HubExchange Routes
app.get('/', routes.index);
app.post('/login', routes.login);
app.post('/logout', routes.logout);


// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save);
app.post('/journeybuilder/validate/', activity.validate);
app.post('/journeybuilder/publish/', activity.publish);
app.post('/journeybuilder/execute/', activity.execute);
app.post('/journeybuilder/getattributegroup/', activity.getattributegroup);
app.post('/journeybuilder/getLoggingSchema/', activity.getLoggingSchema);



http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});