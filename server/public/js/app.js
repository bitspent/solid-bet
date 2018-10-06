let base_url = "";
let ABI = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "myid",
                "type": "bytes32"
            },
            {
                "name": "res",
                "type": "string"
            }
        ],
        "name": "__callback",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "myid",
                "type": "bytes32"
            },
            {
                "name": "result",
                "type": "string"
            },
            {
                "name": "proof",
                "type": "bytes"
            }
        ],
        "name": "__callback",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "details",
        "outputs": [
            {
                "name": "_matchId",
                "type": "uint256"
            },
            {
                "name": "_league",
                "type": "bytes32"
            },
            {
                "name": "_teamOne",
                "type": "bytes32"
            },
            {
                "name": "_teamTwo",
                "type": "bytes32"
            },
            {
                "name": "_matchTimestamp",
                "type": "uint256"
            },
            {
                "name": "_executionDelay",
                "type": "uint256"
            },
            {
                "name": "_price",
                "type": "uint256"
            },
            {
                "name": "_status",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "scoreOne",
                "type": "uint256"
            },
            {
                "name": "scoreTwo",
                "type": "uint256"
            }
        ],
        "name": "subscribe",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "matchResult",
        "outputs": [
            {
                "name": "scoreOne",
                "type": "uint256"
            },
            {
                "name": "scoreTwo",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_matchId",
                "type": "uint256"
            },
            {
                "name": "_league",
                "type": "bytes32"
            },
            {
                "name": "_teamOne",
                "type": "bytes32"
            },
            {
                "name": "_teamTwo",
                "type": "bytes32"
            },
            {
                "name": "_matchTimestamp",
                "type": "uint256"
            },
            {
                "name": "_executionDelay",
                "type": "uint256"
            },
            {
                "name": "_price",
                "type": "uint256"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "result",
                "type": "string"
            }
        ],
        "name": "OraclizeLog",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "addr",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "scoreOne",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "scoreTwo",
                "type": "uint256"
            }
        ],
        "name": "newSubscriber",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "scoreOne",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "scoreTwo",
                "type": "uint256"
            }
        ],
        "name": "betResolved",
        "type": "event"
    }
];

App = {
    web3Provider: null,
    account: null,
    matches: {},
    getAccount: function () {
        return new Promise((resolve, reject) => {
            web3.eth.getAccounts(function (error, accounts) {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(accounts[0]);
                }
            });
        });
    },

    initWeb3: function () {
        return new Promise((resolve, reject) => {
            if (typeof web3 !== 'undefined') {
                App.web3Provider = web3.currentProvider;
            } else {
                App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
                alert("Please install Metamask before proceeding.");
                return;
            }
            web3 = new Web3(App.web3Provider);
            if (web3 == null || typeof web3 === 'undefined') {
                return reject("Something went wrong");
            } else {
                return resolve("Successfully connected to Web3 Provider.");
            }
        });
    },

    createBetContract: function (_matchId) {
        let match = App.matches[_matchId];
        let price = prompt("Enter the bet price.");
        if (isNaN(+price)) {
            console.log("Enter a valid bet price.");
            return;
        }
        let _league = match["league"];
        let _teamOne = match["homeTeam"]["name"];
        let _teamTwo = match["awayTeam"]["name"];
        let _matchTimestamp = Math.floor(new Date(match["utcDate"]).getTime() / 1000);
        let _executionDelay = _matchTimestamp + (3 * 60 * 60);
        let _price = +price * 1e18;
        console.log(+_matchId, _league, _teamOne, _teamTwo, _matchTimestamp, _executionDelay, _price)
        var SolidSportBet = web3.eth.contract(ABI);
        var SolidSportBetInstance = SolidSportBet.new(+_matchId, _league, _teamOne, _teamTwo, _matchTimestamp, _executionDelay, _price, {
                from: App.account,
                value: 0.01 * 1e18,
                data: 0x0
            },

            function (err, deployedContract) {
                if (!err) {
                    if (!deployedContract.address) {
                        console.log(deployedContract["transactionHash"]);
                        $('#solidBetTransactionModal').modal({
                            keyboard: false,
                            show: true
                        });

                        $.ajax({
                            method: 'POST',
                            contentType: 'application/json',
                            url: '/v1/matches/',
                            data: JSON.stringify({
                                account: App.account,
                                matchId: _matchId,
                                transactionHash: deployedContract["transactionHash"],
                            }),
                            success: function (data, textStatus, jqXHR) {
                                $("#solidBetTransactionModalBody").html(`Successfully deployed contract for match: ${_matchId}<br/>Track your transaction on the ropsten network by clicking <a href="https://ropsten.etherscan.io/tx/${deployedContract["transactionHash"]}">here</a>`);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log('Failed to sign in.');
                            }
                        });

                    } else {
                        console.log(deployedContract.address);
                    }
                }
            }
            )
        ;
    },

    getMatches: function () {
        $.ajax({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'GET',
            url: base_url + '/v1/matches',
            success: function (data, textStatus, jqXHR) {
                data.forEach(match => {
                    App.matches[match.id] = match.data;
                    let content = `<tr>`;
                    content += `<td>${match["id"]}</td>`;
                    content += `<td>${match["data"]["league"]}</td>`;
                    content += `<td>${match["data"]["homeTeam"]["name"]}</td>`;
                    content += `<td>${match["data"]["awayTeam"]["name"]}</td>`;
                    content += `<td>${match["data"]["utcDate"]}</td>`;
                    content += `<td><a href="${base_url}/matches/${match["id"]}" target="_blank"><button type="button" class="btn btn-primary">View details</button></a></td>`;
                    content += `<td><button type="button" class="btn btn-primary" onclick=App.createBetContract(${match["id"]})>Create Contract</button></td>`;
                    content += `<td><a href="${base_url}/matches/${match["id"]}/contracts" target="_blank"><button type="button" class="btn btn-primary">View bets</button></a></td>`;
                    content += `</tr>`;
                    $("#upcoming_matches_table").prepend(content)
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        });
    },

    getMatchDetails: function (match_id) {
        $.ajax({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'GET',
            url: `${base_url}/v1/matches/${match_id}`,
            success: function (data, textStatus, jqXHR) {
                let content = "";
                content += `<b>League</b>: ${data['league']}<br/>`;
                content += `<b>Time</b>: ${new Date(data['timestamp'])}<br/>`;
                content += `<b>Status</b>: ${data['status']}<br/>`;
                content += `<b>Team one</b>: ${data['teamOne']['name']}<br/>`;
                content += `<b>Team two</b>: ${data['teamTwo']['name']}<br/>`;
                content += `<b>Team one score</b>: ${data['teamOne']['score']}<br/>`;
                content += `<b>Team two score</b>: ${data['teamTwo']['score']}<br/>`;
                content += `<b>Raw score</b>: ${data['raw']}<br/>`;
                content += `<b>Contracts</b>: <a href="${base_url}/matches/${match_id}/contracts" target="_blank">here</a><br/>`;
                $("#match_details").html(content);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    },

    getMatchContracts: function (match_id) {
        $.ajax({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'GET',
            url: `${base_url}/v1/matches/${match_id}/contracts`,
            success: function (data, textStatus, jqXHR) {
                data.forEach(contract => {
                    let content = "";
                    content += `<tr>`;
                    content += `<td>${contract['id']}</td>`;
                    content += `<td>${contract['data']['matchId']}</td>`;
                    content += `<td><a href="https://ropsten.etherscan.io/address/${contract['data']['contractAddress']}" target="_blank">${contract['data']['contractAddress']}</a></td>`;
                    content += `<td><a href="https://ropsten.etherscan.io/address/${contract['data']['from']}" target="_blank">${contract['data']['from']}</a></td>`;
                    content += `<td><a href="https://ropsten.etherscan.io/tx/${contract['data']['transactionHash']}" target="_blank">here</a></td>`;
                    content += `<td><a href="${base_url}/matches/${match_id}/contracts/${contract['data']['contractAddress']}" target="_blank">here</a></td>`;
                    content += `</tr>`;
                    $("#match_contracts").prepend(content);
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    },

    load: async () => {
        App.account = await App.getAccount();
    },

};

function toHex(s) {
    var hex = '';
    for (var i = 0; i < s.length; i++) {
        hex += '' + s.charCodeAt(i).toString(16);
    }
    return `0x${hex}`;
}

function waitSeconds(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}

function dateToSeconds(current_date) {
    return Math.floor(new Date(current_date).getTime() / 1000);
}

$('#solidBetTransactionModal').on('hidden.bs.modal', function (e) {
    $('#solidBetTransactionModalBody').html('');
});

onload = async () => {
    App.getMatches();

    await App.initWeb3();
    await App.load();
    let pathname = window.location.pathname;
    let link = window.location.href;
    let splitted = link.replace("http://", "");

    console.log(pathname);
    console.log(window.location.href);

    splitted = splitted.split("/");
    if (splitted.length === 3 && splitted[1] === 'matches' && !isNaN(+splitted[2])) {
        App.getMatchDetails(+splitted[2]);
    }

    if (splitted.length === 4 && splitted[1] === 'matches' && !isNaN(+splitted[2]) && splitted[3] === 'contracts') {
        App.getMatchContracts(+splitted[2]);
    }
};