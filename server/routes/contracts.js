var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('./')
});

router.get('/:uuid', function (req, res, next) {
    res.render('./contracts');
});

router.get('/:uuid/:betId', function (req, res, next) {
    db.viewData('contracts', {
        id: req.params.betId
    }, {
        category: true
    })
        .then(_data => {
            if (_data.length !== 1) {
                res.send("Error")
            }
            if (_data[0]['category'] == 'sports') {
                res.render('./contracts/contract_sports_details');
            } else {
                res.render('./contracts/contract_crypto_details');
            }
        })
        .catch(err => {

        });
});

module.exports = router;
