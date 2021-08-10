'use strict';
const express = require('express');
var app = express();

// Deps
var activity = require('./activity');
var path = require('path');
var cors = require('cors')
app.use(cors())
const axios = require('axios');

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

exports.getCookie = function(req, res) {

    if (req.session && req.session.id) {
        // yes, cookie was already present 
        console.log('cookie exists ', req.session.id);
    } else {
        // no: set a new cookie
        var randomNumber = Math.random().toString();
        randomNumber = randomNumber.substring(2, randomNumber.length);
        //res.cookie('JBLoggerApp', randomNumber, { maxAge: 900000, httpOnly: true});
        req.session.id = randomNumber
            // check if client sent cookie
        console.log("session id: ", req.session.id)
    }

}

exports.setCookie = function(req, res) {

}

exports.login = function(req, res) {
    console.log("LOGIN ROUTE")

    console.log('req.body: ', req.body);
    res.send('login');
};

exports.logout = function(req, res) {
    console.log("LOGOUT ROUTE")

    req.session.token = '';
};