var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/crypto', function (req, res, next) {
    res.render('./crypto/crypto');
});

router.get('/sports', function (req, res, next) {
    res.render('./sports/sports');
});

router.get('/crypto/:contract_address', function (req, res, next) {
    res.render('./crypto/crypto_details');
});

router.get('/sports/:contract_address', function (req, res, next) {
    res.render('./sports/match_details');
});

router.get('/contracts/:uuid', function (req, res, next) {
    res.render('./contracts');
});

module.exports = router;
