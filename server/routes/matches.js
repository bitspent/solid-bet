var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('./sports/matches');
});

router.get('/:matchId', function (req, res, next) {
    res.render('./sports/match_details');
});

module.exports = router;
