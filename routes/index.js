'use strict';

// Deps
var activity = require('./activity');
var express = require('express');
var path = require('path');
const { nextTick } = require('process');
const { default: axios } = require('axios');


async function validateAuthCode(config, code) {
    try {

        let authCheck = await axios.post(config.url, config.options)
        return authCheck

    } catch (err) {

        return err

    }
}

/*
 * GET home page.
 */
exports.index = async function(req, res) {
    try {
        console.log("INDEX ROUTE")
            //console.log(req)
            //console.log(req.query)
            //updates
        let redirectURI = 'https%3A%2F%2Ftwilio-integration-dev.herokuapp.com%2Fauthorize';

        if (!req.query.code) {
            const authBase = 'https://mc1q10jrzwsds3bcgk0jjz2s8h80.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id='

            res.redirect(`${authBase}${process.env.sfmcAuthClientID}&redirect_uri=${redirectURI}`)
        } else {
            const code = req.query.code;
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

            let validation = await validateAuthCode(config, code)
            console.log(validation)
            if (validation.data.access_token) {
                res.sendFile(path.join(__dirname, '../public', 'index.html'));
            } else {
                res.send('Unauthorized')
            }
        }
    } catch (err) {
        res.status(404).send(err)
    }


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

exports.authorize = function(req, res) {
    console.log('Authorize')
    const query = req.query;
    const code = query.code;
    console.log(params)
    console.log(code)
    res.send(code)
}