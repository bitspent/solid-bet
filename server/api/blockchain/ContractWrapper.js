let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));

// let abc = [];

// function
db.viewPendingContracts().then(data => {
    if (data[0].contracts.length === 0) {
        return;
    }
    getData(data[0].contracts, 0, data[0].contracts.length);

}).catch(err => {
    console.log(err);
});

function sleep(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve(true);
        }, seconds * 1000);
    });
}


async function getData(_array, _start, _end) {
    if (_start === _end) {
        console.log("Successfully got all pending contracts receipts.");
    } else {
        let contract = _array[_start];
        web3.eth.getTransactionReceipt(contract["transactionHash"])
            .then(receipt => {
                db.updatePendingContract(contract["transactionHash"], {
                    "contractAddress": receipt["contractAddress"],
                    "to": receipt["to"],
                    "from": receipt["from"]
                }).then(result => {
                    console.log(result)
                    _start++;
                    getData(_array, _start, _end);
                }).catch(err => {
                    _start++;
                    getData(_array, _start, _end);
                });

            }).catch(err => {
            _start++;
            getData(_array, _start, _end);
        });

    }
}