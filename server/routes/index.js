var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        website: {
            url: process.env.WEBSITE_DOMAIN + ":" + process.env.WEBSITE_PORT
        }
    });
});

module.exports = router;
