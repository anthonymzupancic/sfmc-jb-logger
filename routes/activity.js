'use strict';
var util = require('util');
const axios = require('axios');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');


const ET_Client = require('sfmc-fuelsdk-node');
const clientId = process.env.sfmcClientId;
const clientSecret = process.env.sfmcClientSecret;
const stack = 'S4';
const origin = process.env.sfmcRestURL;
const authOrigin = process.env.sfmcAuthURL;
const soapOrigin = process.env.sfmcSoapURL;

const sfmcClient = new ET_Client(clientId, clientSecret, stack, {
    origin,
    authOrigin,
    soapOrigin,
    authOptions: {
        authVersion: 2,
        applicationType: 'server'
    }
});

const authCreds = {
    "client_id": process.env.sfmcClientId,
    "client_secret": process.env.sfmcClientSecret,
    "client_type": 'application/json',
    "grant_type": 'client_credentials'
}


//Twilio Client
const accountSid = process.env.twilioAccountSid;
const authToken = process.env.twilioAccessToken;
const client = require('twilio')(accountSid, authToken, { logLevel: 'debug' });

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function(req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function(req, res) {
    // Data from the req and put it in an array accessible to the main app.
    console.log("----- Save Req -----");
    console.log(req.body);
    //logData(req);
    res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function(req, res) {
    // example on how to decode JWT
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            // decoded in arguments
            let decodedArgs = decoded.inArguments[0];

            // validate required parameters
            if (decodedArgs.message && decodedArgs.toPhone && process.env.fromPhone) {
                const message = decodedArgs.message;
                const toPhone = `+${decodedArgs.toPhone}`;
                const email = decodedArgs.sourceFields.filter((item) => {
                    return item.fieldName === 'EmailAddress'
                })
                const id = decodedArgs.sourceFields.filter((item) => {
                    return item.fieldName === 'Phone'
                })

                // // execute twilio message
                // client.messages
                //     .create({
                //         body: message,
                //         from: process.env.fromPhone,
                //         to: toPhone
                //     })
                //     .then(message => console.log(message.sid))
                //     .catch(err => console.error(err));

                //Authenticate API Calls
                auth(authCreds)
                    .then((authRes) => {
                        const restBase = authRes.rest_instance_url
                        const accessToken = authRes.access_token

                        const config = {
                            headers: {
                                "Authorization": "Bearer " + accessToken,
                                "Content-Type": "application/json"
                            }
                        }

                        let updateDE = [{
                            "keys": {
                                "EmailAddress": email.binding,
                                "ID": id.binding
                            },
                            "values": {
                                "Code": "Response 1"
                            }
                        }]
                        let deInsertURL = `${restBase}/hub/v1/dataevents/key:DFEFBF74-B3E4-45A6-BD18-6AC0D1BA3E97/rowset`

                        axios.post('deInsertURL', config, updateDE)

                    })
                    .catch((err) => {
                        console.log(err)
                    })

                logData(req);
                res.send(200, 'Execute');

            } else {
                console.error('missing required inputs.');
                return res.status(400).end();
            }

        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function(req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function(req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Validate');
};


exports.getattributegroup = function(req, res) {

    res.json(decoded)

}


exports.init = function(req, res) {

    var options = {
        props: { "Name": "SDKDataExtension from JB App", "Description": "SDK Created Data Extension" },
        columns: [{ "Name": "Key", "FieldType": "Text", "IsPrimaryKey": "true", "MaxLength": "100", "IsRequired": "true" }, { "Name": "Value", "FieldType": "Text" }]
    };

    var de = sfmcClient.dataExtension(options);

    de.post(function(err, response) {
        if (err) {
            res.status(500).send(err)
        } else {
            var statusCode = response && response.res && response.res.statusCode ? response.res.statusCode : 200;
            var result = response && response.body ? response.body : response;
            response && res.status(statusCode).send(result);
        }
    });
};



async function auth(creds) {
    let authBase = process.env.authOrigin
    let authURL = `${authBase}/v2/token`

    const response = await axios.post(authURL, creds)
    return response.data
}