var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    db.viewData('matches', {}, {id: true, data: true})
        .then(matches => {
            return res.json(matches);
        })
        .catch(err => {
            return res.send(err);
        });
});

router.get('/:matchId', function (req, res, next) {
    db.viewData('matches', {
        data: {
            id: +req.params.matchId
        }
    }, {id: true, data: true})
        .then(_data => {
            if (_data.length === 0) {
                return res.send({});
            }
            let data = _data[0];
            let match = data["data"];
            let league = match["league"];
            let lastUpdated = match["utcDate"];
            let timestamp = Math.floor(new Date(lastUpdated).getTime() / 1000);
            let score = match["score"]["fullTime"];
            let teamOne = {
                name: match["homeTeam"]["name"],
                score: score["homeTeam"] === null ? '0' : formatScore(score["homeTeam"])
            };
            let teamTwo = {
                name: match["awayTeam"]["name"],
                score: score["awayTeam"] === null ? '0' : formatScore(score["awayTeam"])
            };

            let raw = (teamOne['score'] + teamTwo['score']).length === 2 ? '0' : teamOne['score'] + teamTwo['score'];

            let status = match["status"];
            return res.json({
                league,
                timestamp,
                status,
                teamOne,
                teamTwo,
                raw
            });
        }).catch(error => {
        return res.send(error);
    });
});

router.get('/:matchId/bets', function (req, res, next) {
    db.viewData('contracts', {
        data: {
            matchId: +req.params.matchId
        }
    }, {
        id: true,
        data: {
            matchId: true,
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

router.get('/:matchId/bets/:betId', function (req, res, next) {
    db.viewData('contracts', {
        id: req.params.betId,
        data: {
            matchId: +req.params.matchId,
        }
    }, {
        id: true,
        data: {
            matchId: true,
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

module.exports = router;
