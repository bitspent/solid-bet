var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('./matches/matches');
});

router.get('/:matchId', function (req, res, next) {
    res.render('./matches/match_details');
});

router.get('/:matchId/bets', function (req, res, next) {
    res.render('./contracts/contracts');
});

router.get('/:matchId/bets/:betId', function (req, res, next) {
    res.render('./contracts/contract_details');
});

module.exports = router;