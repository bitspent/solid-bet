var express = require('express');
var router = express.Router();

router.get('/:uuid', function (req, res, next) {
    db.viewData('contracts', {
        uuid: +req.params.uuid
    }, {
        category: true,
        id: true,
        uuid: true,
        transactionHash: true,
        to: true,
        from: true,
        time: true,
        type: true,
        execution_time: true
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
});

router.get('/:uuid/:betId', function (req, res, next) {
    db.viewData('contracts', {
        id: req.params.betId,
        uuid: +req.params.uuid,
    }, {
        category: true,
        id: true,
        uuid: true,
        contractAddress: true,
        transactionHash: true,
        to: true,
        from: true,
        time: true,
        type: true,
        execution_time: true
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
});

router.get('/', function (req, res, next) {
    db.viewData('contracts', function (contract) {
        let today = new Date();
        let today_timestamp = today.getTime() / 1000;
        return contract("execution_time").gt(today_timestamp)
    }, {
        id: true,
        category: true,
        currencyId: true,
        contractAddress: true,
        transactionHash: true,
        to: true,
        from: true,
        time: true,
        type: true,
        execution_time: true
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
});

module.exports = router;
