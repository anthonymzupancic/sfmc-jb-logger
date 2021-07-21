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
    res.send('INDEX')

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

    console.log(req)
    res.send('AUTHORIZE')
}