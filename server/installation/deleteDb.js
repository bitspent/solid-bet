r = require('rethinkdb');
let db = new (require('../api/rethinkdb/Database'));
let async = require('async');
// require('dotenv').config({path: '/Users/hassanjawhar/Desktop/Workspace/solid-bet/server/.env'});
require('dotenv').config({path: '/root/server/.env'});

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
        db.deleteDatabase('neombet')
            .then(result => {
                parallelCb(null, "Successfully deleted neombet database.");
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