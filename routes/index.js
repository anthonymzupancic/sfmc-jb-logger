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