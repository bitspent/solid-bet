class Matches {
    constructor() {
    }

    getMatchDetails(id) {
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
        let data = {
            league,
            timestamp,
            status,
            teamOne,
            teamTwo,
            raw
        }
    }


    insertMatches(data){
        let matches = data.matches;
        let competition = data.competition;
        let keyyed_matches = {};

        matches.forEach(match => {
            keyyed_matches[match.id] = match;
            keyyed_matches[match.id]["league"] = competition["name"];
        });
        console.log(JSON.stringify(keyyed_matches))
        // console.log(competition)
    }

}


// let footballdata = new (require('../api/matches/FootballData'))('ed06bf4058f04f9288f8fe44a55bc263');

// footballdata.getLeagueMatches('CL').then(matches=>{
//     console.log(JSON.stringify(matches))
// }).catch(err=>console.log(err))


// footballdata.getMarchDetails(200063).then(matches=>{
//     console.log(matches)
// }).catch(err=>console.log(err))

// let MATCHES = require('./matches');
// let KEYED_MATCHES = require('./keyed_matches');

function printKeyedMatches() {

}

// printMatches()


// printKeyedMatches()
// printMatchDetails(238916)
// printMatchDetails(250757)
