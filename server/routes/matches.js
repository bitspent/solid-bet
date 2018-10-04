var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    db.viewMatches()
        .then(matches => {
            console.log("Total matches: " + matches.length)
            return res.json(matches[0]);
        })
        .catch(err => {
            return res.send(err);
        });
});

router.get('/:matchId', async (req, res, next) => {
    db.viewMatch(req.params.matchId)
        .then(data => {
            let match = data["data"];
            let league = match["league"];
            let lastUpdated = match["lastUpdated"];
            let timestamp = Math.floor(new Date(lastUpdated).getTime() / 1000);
            let score = match["score"]["fullTime"];
            let teamOne = {
                name: match["homeTeam"]["name"],
                score: score["homeTeam"] === null ? '0' : '00' + score["homeTeam"]
            };
            let teamTwo = {
                name: match["awayTeam"]["name"],
                score: score["awayTeam"] === null ? '0' : '00' + score["awayTeam"]
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

module.exports = router;
