'use strict';

// Deps
var activity = require('./activity');
var express = require('express');
var path = require('path');
const { nextTick } = require('process');
const { default: axios } = require('axios');

/*
 * GET home page.
 */
exports.index = function(req, res) {
    console.log("INDEX ROUTE")
        //console.log(req)
        //console.log(req.query)
        //updates
    let redirectURI = 'https%3A%2F%2Ftwilio-integration-dev.herokuapp.com';

    if (!req.query.code) {
        const authBase = 'https://mc1q10jrzwsds3bcgk0jjz2s8h80.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id='

        res.redirect(`${authBase}${process.env.sfmcAuthClientID}&redirect_uri=${redirectURI}`)
    } else {
        const authCheck = 'https://mc1q10jrzwsds3bcgk0jjz2s8h80.auth.marketingcloudapis.com/v2/token';
        let options = {
            "grant_type": "authorization_code",
            "code": req.query.code,
            "client_id": process.env.sfmcAuthClientID,
            "redirect_uri": redirectURI
        }

        axios.post(authCheck, options)
            .then((res) => {
                console.log(res)
                res.send(res)
            })
            .catch((err) => {
                console.log(err)
                res.send(err)

            })


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