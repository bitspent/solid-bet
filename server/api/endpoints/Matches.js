var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    db.viewData('matches', {}, {
        id: true,
        season: true,
        utcDate: true,
        status: true,
        lastUpdated: true,
        homeTeam: true,
        awayTeam: true,
        score: true,
        league: true
    })
        .then(matches => {
            let temp = [];
            matches.forEach(match => {
                if (new Date(match['utcDate']).getTime() > new Date().getTime()) {
                    temp.push(match);
                }
            });
            temp.sort(function (a, b) {
                return new Date(b['utcDate']).getTime() - new Date(a['utcDate']).getTime();
            });
            return res.json(temp);
        })
        .catch(err => {
            return res.send(err);
        });
});

router.get('/expired', function (req, res, next) {
    db.viewData('matches', {}, {
        id: true,
        season: true,
        utcDate: true,
        status: true,
        lastUpdated: true,
        homeTeam: true,
        awayTeam: true,
        score: true,
        league: true
    })
        .then(matches => {
            let temp = [];
            matches.forEach(match => {
                if (new Date(match['utcDate']).getTime() < new Date().getTime()) {
                    temp.push(match);
                }
            });
            temp.sort(function (a, b) {
                return new Date(b['utcDate']).getTime() - new Date(a['utcDate']).getTime();
            });
            return res.json(temp);
        })
        .catch(err => {
            return res.send(err);
        });
});

router.get('/:matchId', function (req, res, next) {
    db.viewData('matches', {
        id: +req.params.matchId
    }, {
        id: true,
        season: true,
        utcDate: true,
        status: true,
        lastUpdated: true,
        homeTeam: true,
        awayTeam: true,
        score: true,
        league: true
    })
        .then(_data => {
            if (_data.length === 0) {
                return res.send({});
            }
            let match = _data[0];
            let league = match["league"];
            let lastUpdated = match["utcDate"];
            let timestamp = Math.floor(new Date(lastUpdated).getTime() / 1000);
            let score = match["score"]["fullTime"];
            let teamOne = {
                name: match["homeTeam"]["name"],
                score: score["homeTeam"] === null ? '0' : score["homeTeam"]
            };
            let teamTwo = {
                name: match["awayTeam"]["name"],
                score: score["awayTeam"] === null ? '0' : score["awayTeam"]
            };

            let raw;
            if (formatScore(teamOne['score']) === '000' && formatScore(teamTwo['score']) === '000') {
                raw = '0';
            } else {
                raw = formatScore(teamOne['score']) + formatScore(teamTwo['score']);
            }

            console.log(raw);
            let status = match["status"];
            let object = {
                league,
                timestamp,
                status,
                teamOne,
                teamTwo,
                raw
            };
            return res.json(object);
        }).catch(error => {
        return res.send(error);
    });
});


function formatScore(score) {
    score = score + '';
    while (score.length < 3) score = '0' + score;
    return score;
}

module.exports = router;
