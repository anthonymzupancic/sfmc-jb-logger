'use strict';

// Deps
const express = require('express');
const path = require('path');
var cookieSession = require('cookie-session')

const axios = require('axios');

exports.cookie = function(req, res, next) {
    // check if client sent cookie

    if (req.session && req.session.id) {
        // yes, cookie was already present 
        console.log('cookie exists ', req.session.id);
    } else {
        // no: set a new cookie
        var randomNumber = Math.random().toString();
        randomNumber = randomNumber.substring(2, randomNumber.length);
        //res.cookie('JBLoggerApp', randomNumber, { maxAge: 900000, httpOnly: true});
        req.session.id = randomNumber
        console.log("session id: ", req.session.id)
    }
    next(); // <-- important!
}


exports.authorize = function(req, res, next) {
    console.log('*** Authorize Endpoint ***')
        // console.log(req)
    if (!req.session.id) {
        if (!req.query.code) {
            console.log('*** Retrieve Code ***')

            let redirectURI = 'https%3A%2F%2Ftwilio-integration-dev.herokuapp.com';
            const authBase = 'https://mc1q10jrzwsds3bcgk0jjz2s8h80.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id='
            res.redirect(`${authBase}${process.env.sfmcAuthClientID}&redirect_uri=${redirectURI}`)
        } else if (req.query.code) {
            console.log('*** Validate Code ***')
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
                        .then((resp) => {
                            if (!resp.data.access_token) {
                                res.send('Unauthorized')
                            } else {
                                console.log('Access Token Found')
                                console.log(resp.data.access_token)

                                next()
                            }
                        })
                        .catch((err) => {
                            console.log(err)
                            res.send(err)
                        })

                } else {
                    res.send('Unauthorized: no code provided.')
                }
            } catch (err) {
                console.log(err)
            }
        }
    } else {
        next();
    }

}