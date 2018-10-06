require('dotenv');
r = require('rethinkdb');
let db = new (require('../api/rethinkdb/Database'));
let async = require('async');


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
        db.createDatabase('neombet')
            .then(result => {
                parallelCb(null, "Successfully created neombet database.");
            })
            .catch(err => {
                parallelCb(err, null);
            });
    },
    three: function (parallelCb) {
        db.createTable('contracts')
            .then(result => {
                parallelCb(null, "Successfully created contracts table.");
            })
            .catch(err => {
                parallelCb(err, null);
            });
    },
    four: function (parallelCb) {
        db.createTable('matches')
            .then(result => {
                parallelCb(null, "Successfully created matches table.");
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