var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('./crypto/tickers');
});

router.get('/:currenctId', function (req, res, next) {
    res.render('./crypto/cryto_details');
});

router.get('/:currenctId/bets', function (req, res, next) {
    res.render('./contracts/contracts_crypto');
});

router.get('/:currenctId/bets/:betId', function (req, res, next) {
    res.render('./contracts/contract_crypto_details');
});

module.exports = router;
