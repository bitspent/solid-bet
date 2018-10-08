let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));

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
        web3.eth.getTransactionReceipt("0xa7cafea207f9ab828ed64a22117818e0ab879167e863a89488e9479a3f73b0ee")
            .then(receipt => {
                db.updateData('contracts', {
                        data: {
                            transactionHash: receipt['transactionHash']
                        }
                    },
                    {
                        data: {
                            "contractAddress": receipt["contractAddress"],
                            "from": receipt["from"]
                        }
                    })
                    .then(result => {
                        parallelCb(null, result)
                    })
                    .catch(err => {
                        parallelCb(err, null)
                    });

            })
            .catch(err => {
                parallelCb(err, null)
            });

    }
}, function (err, results) {
    if (err) {
        console.log(err);
    } else {
        console.log(results);
    }
});



