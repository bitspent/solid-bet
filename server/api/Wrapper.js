let footballdata = new (require('../api/bets/sports/FootballData'));
let Web3 = require('web3');

class Wrapper {
    constructor(db) {
        this.web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
        this.updating_contracts = false;
        this.db = db;
    }

    async getData(_data, _start, _end) {
        if (_start === _end) {
            console.log("Successfully got all pending contracts receipts.");
            this.updating_contracts = false;
        } else {
            this.updating_contracts = true;
            let contract = _data[_start];
            let receipt = await this.web3.eth.getTransactionReceipt(contract["transactionHash"]);
            if (receipt) {
                let updated = await this.db.updateData('contracts', {
                        transactionHash: receipt['transactionHash']
                    },
                    {
                        "contractAddress": receipt["contractAddress"],
                        "from": receipt["from"]
                    });
            }
            _start++;
            this.getData(_data, _start, _end);
        }
    }

    updateContracts() {
        if (this.updating_contracts === false) {
            this.db.viewData('contracts', {
                contractAddress: null
            }, {
                id: true,
                matchId: true,
                transactionHash: true,
                to: true,
                from: true,
                time: true
            }).then(data => {
                if (data.length === 0) {
                    console.log("There's nothing to update.");
                } else {
                    console.log(`Updating ${data.length} contracts.`);
                    this.getData(data, 0, data.length);
                }
            }).catch(err => {
                console.log(err);
            });
        } else {

        }
    }

    async insertMatches(league) {
        let data = await footballdata.getLeagueMatches(league);
        let matches = data.matches;
        let competition = data['competition'];
        let keyyed_matches = {};

        matches.forEach(match => {
            keyyed_matches[match.id] = match;
            keyyed_matches[match.id]["league"] = competition["name"];
            // console.log(match)
            this.db.insertData('matches', match)
                .then(result => {
                    // console.log(`Successfully inserted matches`)
                })
                .catch(err => {
                    console.log(`Failed to insert matches.`);
                });
        });
        console.log(`League: ${league} - successfully inserted ${matches.length} matches`)
    }

    async updateData(league) {
        let data = await footballdata.getLeagueMatches(league);
        let matches = data.matches;
        let competition = data['competition'];
        let keyyed_matches = {};
        let error = false;
        matches.forEach(match => {
            keyyed_matches[match.id] = match;
            keyyed_matches[match.id]["league"] = competition["name"];

            this.db.updateData('matches',
                {
                    data: {
                        matchId: [match.id],
                    }
                }, {
                    data: match
                }
            )
                .then(result => {
                    // console.log(`Successfully updated match ${match.id}`)
                })
                .catch(err => {
                    console.log(`Failed to update match ${match.id}`);
                });
        });
    }
}

function sleep(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve(true);
        }, seconds * 1000);
    });
}

module.exports = Wrapper;