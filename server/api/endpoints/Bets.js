var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    db.viewData('bets', function (contract) {
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
        bettor: true,
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
