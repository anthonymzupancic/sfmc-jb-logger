'use strict';

// Deps
var activity = require('./activity');
var express = require('express');
var path = require('path');
const { nextTick } = require('process');
const { default: axios } = require('axios');


// async function validateAuthCode(config, code) {
//     try {

//         let authCheck = await axios.post(config.url, config.options)
//         return authCheck

//     } catch (err) {

//         return err

//     }
// }

/*
 * GET home page.
 */
exports.index = function(req, res) {
    try {
        console.log("INDEX ROUTE")
        console.log(req)
            //if( !req.session.token ) {
            //     res.render( 'index', {
            //         title: 'Unauthenticated',
            //         errorMessage: 'This app may only be loaded via the ExactTarget Marketing Cloud',
            //     });
            // } else {
        res.render('index', {
            title: 'Journey Builder Activity Example: Desk.com API',
            results: activityUtils.logExecuteData,
        });
        //}
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
    console.log('*** Authorize Endpoint ***')
    console.log(req)

    res.send('Authorize Endpoint')
}