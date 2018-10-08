r = require('rethinkdb');
db = new (require('../api/rethinkdb/Database'));
let async = require('async');
require('dotenv').config({path: '/Users/hassanjawhar/Desktop/Workspace/solid-bet/server/.env'});
let array = ""
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
        db.viewData('matches', {}, {
            id: true,
            data: true
        })
            .then(result => {
                parallelCb(null, result);
            })
            .catch(err => {
                parallelCb(err, null);
            });

    },
}, function (err, results) {
    if (err) {
        console.log(err);
    } else {
        console.log(results);
    }
});