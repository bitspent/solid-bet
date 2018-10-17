var request = require('request');

class CoinMarketCap {

    constructor() {

    }

    getTickers() {
        var options = {
            url: `https://api.coinmarketcap.com/v2/ticker/?limit=20&sort=rank`,
            method: 'GET',
            headers: {
                'User-Agent': 'request'
            }
        };
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    var info = JSON.parse(body);
                    return resolve(info);
                } else {
                    return reject(error);
                }
            });
        });
    }
}

module.exports = CoinMarketCap;