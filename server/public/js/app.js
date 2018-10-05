let base_url = "http://localhost:3000";
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
        "constant": false,
        "inputs": [],
        "name": "unpause",
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
        "constant": true,
        "inputs": [],
        "name": "paused",
        "outputs": [
            {
                "name": "",
                "type": "bool"
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
        "constant": false,
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
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
        "constant": false,
        "inputs": [
            {
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
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
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "Pause",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "Unpause",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
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
        // _matchId , _league, _teamOne, _teamTwo, _matchTimestamp, _executionDelay
        let _league = match["league"];
        let _teamOne = match["homeTeam"]["name"];
        let _teamTwo = match["awayTeam"]["name"];
        let _matchTimestamp = Math.floor(new Date(match["utcDate"]).getTime() / 1000);
        let _executionDelay = _matchTimestamp + (3 * 60 * 60);
        let _price = +price * 1e18;
console.log(_price)
        var SolidSportBet = web3.eth.contract(ABI);
        var SolidSportBetInstance = SolidSportBet.new(_matchId, _league, _teamOne, _teamTwo, _matchTimestamp, _executionDelay, _price, {
            from: App.account
        }, function (err, deployedContract) {
            if (!err) {
                if (!deployedContract.address) {
                    console.log(deployedContract.transactionHash);
                } else {
                    console.log(deployedContract.address);
                }
            }
        });
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
                    content += `<td><button type="button" class="btn btn-primary" onclick=App.createBetContract(${match["id"]})>Create Contract</button></td>`;
                    content += `</tr>`;
                    $("#upcoming_matches_table").prepend(content)
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        });
    },


    load: async () => {
        App.account = await App.getAccount();
    },

};


onload = async () => {
    App.getMatches();

    await App.initWeb3();
    await App.load();
};

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