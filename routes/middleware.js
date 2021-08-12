'use strict';

// Deps
const express = require('express');
var app = express();
const path = require('path');
var cookieSession = require('cookie-session')
var cors = require('cors')
var cookies = require('cookies');
const cookieParser = require("cookie-parser");

app.use(cookieParser())


app.use(cors())

const axios = require('axios');

exports.authorize = function(req, res, next) {

    console.log('cookies: ', req.cookies.jbLoggerSession)
    if (!req.cookies.jbLoggerSession) {
        console.log('*** Authorize Endpoint ***')
            // console.log(req)

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
    }
    next()

}