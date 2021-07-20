'use strict';

// Deps
var express = require('express');
var activity = require('./activity');
var path = require('path');


/*
 * GET home page.
 */
exports.index = function(req, res) {
    console.log(req)

    if (!req.session.token) {
        res.render('index', {
            title: 'Unauthenticated',
            errorMessage: 'This app may only be loaded via Salesforce Marketing Cloud',
        });
    } else {
        console.log('*** in index route ***')
        console.log(req.session.token)
        res.render('index', {
            title: 'Journey Builder Activity',
            results: activity.logExecuteData,
        });
    }
};

exports.login = function(req, res) {
    console.log('req.body: ', req.body);
    res.redirect('/');
};

exports.logout = function(req, res) {
    req.session.token = '';
};