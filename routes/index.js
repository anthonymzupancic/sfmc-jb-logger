'use strict';

// Deps
var activity = require('./activity');


/*
 * GET home page.
 */
exports.index = function(req, res) {
    //console.log(req)

    // console.log('*** in index route ***')
    // console.log(req.session)

    if (req.session.token) {
        res.render('index', {
            title: 'Journey Builder Activity',
            results: activity.logExecuteData,
        });
    }
};

exports.login = function(req, res) {
    //console.log('req.body: ', req.body);
    res.redirect('/');
};

exports.logout = function(req, res) {
    req.session.token = '';
};