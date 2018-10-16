var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('./sports/matches');
});

router.get('/:matchId', function (req, res, next) {
    res.render('./sports/match_details');
});

router.get('/:matchId/bets', function (req, res, next) {
    res.render('./contracts/contracts_sports');
});

router.get('/:matchId/bets/:betId', function (req, res, next) {
    res.render('./contracts/contract_sports_details');
});

module.exports = router;
