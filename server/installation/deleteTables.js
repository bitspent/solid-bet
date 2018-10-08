r = require('rethinkdb');
let db = new (require('../api/rethinkdb/Database'));
let async = require('async');
require('dotenv').config({path: '/Users/hassanjawhar/Desktop/Workspace/solid-bet/server/.env'});

async.series({
    one: function (parallelCb) {
        db.initializeConnection()
            .then(conn => {
                r.connection = conn;
                parallelCb(null, "Successfully connected to database.");
            })
            .catch(err => {
                parallelCb(err, null);
            });
    },
    two: function (parallelCb) {
        db.dropTable('contracts')
            .then(result => {
                parallelCb(null, "Successfully deleted contracts database.");
            })
            .catch(err => {
                parallelCb(err, null);
            });
    },
    three: function (parallelCb) {
        db.dropTable('matches')
            .then(result => {
                parallelCb(null, "Successfully deleted matches database.");
            })
            .catch(err => {
                parallelCb(err, null);
            });
    },
    four: function (parallelCb) {
        db.createTable('contracts')
            .then(result => {
                parallelCb(null, "Successfully created contracts database.");
            })
            .catch(err => {
                parallelCb(err, null);
            });
    },
    five: function (parallelCb) {
        db.createTable('matches')
            .then(result => {
                parallelCb(null, "Successfully created matches database.");
            })
            .catch(err => {
                parallelCb(err, null);
            });
    }
}, function (err, results) {
    if (err) {
        console.log(err);
    } else {
        console.log(results);
    }
});