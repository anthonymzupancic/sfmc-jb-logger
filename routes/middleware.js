'use strict';

// Deps
const express = require('express');
const path = require('path');
var cookieSession = require('cookie-session')

const axios = require('axios');

exports.cookie = function(req, res, next) {
    // check if client sent cookie
    var cookie = req.cookies.JBLoggerApp;
    console.log('*** Coookies ***')
    console.log(req.cookies)
    console.log(req.signedCookies)
    if (cookie === undefined) {
        // no: set a new cookie
        var randomNumber = Math.random().toString();
        randomNumber = randomNumber.substring(2, randomNumber.length);
        //res.cookie('JBLoggerApp', randomNumber, { maxAge: 900000, httpOnly: true});
        res.cookie('JBLoggerApp', randomNumber);
        console.log('cookie created successfully');
    } else {
        // yes, cookie was already present 
        console.log('cookie exists', cookie);
    }
    next(); // <-- important!
}


exports.authorize = function(req, res, next) {
    console.log('*** Authorize Endpoint ***')
    console.log(req)
    if (typeof req.session === 'undefined' || typeof req.session.auth === 'undefined' || !req.session.auth) {
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

                                req.session.auth = true;
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
        console.log("auth session: " + req.session.auth)
    }
}