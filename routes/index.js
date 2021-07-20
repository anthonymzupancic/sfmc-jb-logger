'use strict';

// Deps
var activity = require('./activity');


/*
 * GET home page.
 */
exports.index = function(req, res) {

    if (req.session && req.session.token) {
        console.log('*** Token ***')
        console.log(req.session.token)
        console.log('*** Token ***')

        res.render('index', {
            title: 'Journey Builder Activity',
            results: activity.logExecuteData,
        });
    } else if (!req.session) {
        res.status(404).send('Unauthorized')
    }

};

exports.login = function(req, res) {
    //console.log('req.body: ', req.body);
    res.redirect('/');
};

exports.logout = function(req, res) {
    req.session.token = '';
};