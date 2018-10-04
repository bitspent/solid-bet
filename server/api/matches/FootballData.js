var request = require('request');

class FootballData {

    constructor() {
        this.API_KEY = process.env.API_KEY;
    }

    getApiKey() {
        return process.env.API_KEY;
    }

    getLeagueMatches(league) {
        var options = {
            url: `https://api.football-data.org/v2/competitions/${league}/matches`,
            method: 'GET',
            headers: {
                'User-Agent': 'request',
                'X-Auth-Token': this.getApiKey()
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

    getMatchDetails(id) {
        var options = {
            url: `https://api.football-data.org/v2/matches/${id}`,
            method: 'GET',
            headers: {
                'User-Agent': 'request',
                'X-Auth-Token': this.getApiKey()
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

module.exports = FootballData;