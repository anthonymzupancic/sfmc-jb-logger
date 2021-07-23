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
const { query } = require('express');

var app = express();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({ type: 'application/jwt' }));
app.use(bodyParser.urlencoded({ extended: true }));



//app.use(express.methodOverride());
//app.use(express.favicon());

async function validateAuthCode(config, code) {
    try {

        let authCheck = await axios.post(config.url, config.options)
        return authCheck

    } catch (err) {

        return err

    }
}

const getCode = ((req, res, next) => {
    if (req.query.code) {
        next()
    } else {
        const authBase = 'https://mc1q10jrzwsds3bcgk0jjz2s8h80.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id='
        res.redirect(`${authBase}${process.env.sfmcAuthClientID}&redirect_uri=${redirectURI}`)
    }
})

const verifyCode = ((req, res, next) => {
    try {
        if (req.query.code) {
            const config = {
                url: 'https://mc1q10jrzwsds3bcgk0jjz2s8h80.auth.marketingcloudapis.com/v2/token',
                options: {
                    "grant_type": "authorization_code",
                    "code": req.query.code,
                    "client_id": process.env.sfmcAuthClientID,
                    "client_secret": process.env.sfmcAuthClientSecret,
                    "redirect_uri": "https://twilio-integration-dev.herokuapp.com/authorize"
                }
            }

            let validation = validateAuthCode(config, code)
            console.log(validation)
            if (!validation.data.access_token) {
                res.send('Unauthorized')
            } else {
                next()
            }
        } else {

        }
    } catch (err) {
        console.log(err)
    }

})



// Express in Development Mode
if ('development' == app.get('env')) {
    app.use(errorhandler());
}

app.use(getCode)
app.use(verifyCode)
app.use(express.static(path.join(__dirname, 'public')));

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



http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});