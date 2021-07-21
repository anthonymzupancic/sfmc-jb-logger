'use strict';

// Deps
var activity = require('./activity');
var express = require('express');
var path = require('path');

/*
 * GET home page.
 */
exports.index = function(req, res) {
    console.log("INDEX ROUTE")
    if (req.session && req.session.token) {
        console.log('*** Token ***')
        console.log(req.session.token)
        console.log('*** Token ***')

        // res.render('index', {
        //     title: 'Journey Builder Activity',
        //     results: activity.logExecuteData,
        // });

        res.send('./public/index.html')

    } else if (!req.session) {
        res.status(404).send('Unauthorized')
    }

};

exports.login = function(req, res) {
    console.log("LOGIN ROUTE")

    console.log('req.body: ', req.body);
    res.redirect('/');
};

exports.logout = function(req, res) {
    console.log("LOGOUT ROUTE")

    req.session.token = '';
};

exports.authorize = function(req, res) {
    const authBase = 'https://mc1q10jrzwsds3bcgk0jjz2s8h80.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id='
    let redirectURI = 'https%3A%2F%2Ftwilio-integration-dev.herokuapp.com%2F';

    res.redirect(`${authBase}${process.env.sfmcAuthClientID}&redirect_uri=${redirectURI}`)
}

exports.authenticate = function(req, res) {
    res.send('AUTHENTICATE')
}