'use strict';

// Deps
var activity = require('./activity');
var express = require('express');
var path = require('path');
const { default: axios } = require('axios');

/*
 * GET home page.
 */
exports.index = function(req, res) {

    console.log("INDEX ROUTE")
        //if( !req.session.token ) {
        //     res.render( 'index', {
        //         title: 'Unauthenticated',
        //         errorMessage: 'This app may only be loaded via the ExactTarget Marketing Cloud',
        //     });
        // } else {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));

    //res.sendFile('/views/index.html');
    //}

};

exports.login = function(req, res) {
    console.log("LOGIN ROUTE")

    console.log('req.body: ', req.body);
    res.send('login');
};

exports.logout = function(req, res) {
    console.log("LOGOUT ROUTE")

    req.session.token = '';
};

exports.authorize = function(req, res, next) {
    console.log('*** Authorize Endpoint ***')

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