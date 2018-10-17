var express = require('express');
var router = express.Router();

let coinmarketcap = new (require('../../api/bets/crypto/coinmarketcap'));
let tickers = [];

getTickers();
/* GET home page. */
router.get('/tickers', function (req, res, next) {
    return res.json(tickers);
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

setInterval(() => {
    getTickers();
}, 60 * 1000);

module.exports = router;
