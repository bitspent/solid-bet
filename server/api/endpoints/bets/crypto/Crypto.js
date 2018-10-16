var express = require('express');
var router = express.Router();

let coinmarketcap = new (require('../../../../api/bets/crypto/coinmarketcap'));
let tickers = [];

getTickers();
/* GET home page. */
router.get('/tickers', function (req, res, next) {
    return res.json(tickers);
});

router.get('/:currencyId/bets', function (req, res, next) {
    db.viewData('contracts', {
        data: {
            currencyId: +req.params.currencyId
        }
    }, {
        id: true,
        data: {
            currencyId: true,
            transactionHash: true,
            to: true,
            from: true
        }
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
});

function getTickers() {
    tickers = [];
    coinmarketcap.getTickers().then(result => {
        let data = result['data'];
        for (let id in data) {
            if (data.hasOwnProperty(id)) {
                let info = {
                    id: data[id]['id'],
                    name: data[id]['name'],
                    symbol: data[id]['symbol'],
                    rank: data[id]['rank']
                };
                tickers.push(info);
            }
        }

        tickers.sort(function (a, b) {
            return a['rank'] - b['rank'];
        });
        console.log("Successfully retrieved all tickers data.");
    }).catch(err => console.error(err));
}

router.get('/:currencyId/bets/:betId', function (req, res, next) {
    db.viewData('contracts', {
        id: req.params.betId,
        data: {
            currencyId: +req.params.currencyId,
        }
    }, {
        id: true,
        data: {
            currencyId: true,
            contractAddress: true,
            transactionHash: true,
            to: true,
            from: true
        }
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
});

setInterval(() => {
    getTickers();
}, 60 * 1000);

module.exports = router;
