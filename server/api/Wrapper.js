let footballdata = new (require('../api/matches/FootballData'));

async function insertMatches(league) {
    let data = await footballdata.getLeagueMatches(league);
    let matches = data.matches;
    let competition = data.competition;
    let keyyed_matches = {};

    matches.forEach(match => {
        keyyed_matches[match.id] = match;
        keyyed_matches[match.id]["league"] = competition["name"];

        db.insertData({
            id: match.id,
            data: match
        })
            .then(result => {
                console.log(`Successfully inserted matches`)
            })
            .catch(err => {
                console.log(`Failed to insert matches.`);
            });

    });
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

        db.updateMatch(match.id, {data: match})
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

