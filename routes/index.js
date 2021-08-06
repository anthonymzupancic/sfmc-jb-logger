'use strict';

// Deps
var activity = require('./activity');
var path = require('path');

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

exports.login = function(req, res) {
    console.log("LOGIN ROUTE")

    console.log('req.body: ', req.body);
    res.send('login');
};

exports.logout = function(req, res) {
    console.log("LOGOUT ROUTE")

    req.session.token = '';
};