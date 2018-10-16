let footballdata = new (require('../api/bets/sports/FootballData'));

async function insertMatches(league) {
    let data = await footballdata.getLeagueMatches(league);
    let matches = data.matches;
    let competition = data.competition;
    let keyyed_matches = {};

    matches.forEach(match => {
        keyyed_matches[match.id] = match;
        keyyed_matches[match.id]["league"] = competition["name"];

        db.insertData('matches', {
            id: match.id,
            data: match
        })
            .then(result => {
                // console.log(`Successfully inserted matches`)
            })
            .catch(err => {
                console.log(`Failed to insert matches.`);
            });
    });
    console.log(`League: ${league} - successfully inserted ${matches.length} matches`)
}

async function updateData(league) {
    let data = await footballdata.getLeagueMatches(league);
    let matches = data.matches;
    let competition = data.competition;
    let keyyed_matches = {};
    let error = false;
    matches.forEach(match => {
        keyyed_matches[match.id] = match;
        keyyed_matches[match.id]["league"] = competition["name"];

        db.updateData('matches',
            {
                data: {
                    matchId: [match.id],
                }
            }, {
                data: match
            }
        )
            .then(result => {
                console.log(`Successfully updated match ${match.id}`)
            })
            .catch(err => {
                console.log(`Failed to update match ${match.id}`);
            });
    });
}

module.exports = {
    insertMatches,
    updateData,
};

