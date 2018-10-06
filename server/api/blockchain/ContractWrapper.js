let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));

db.viewData('contracts', {
    data: {
        contractAddress: null
    }
}).then(data => {
    if (data.length === 0) {
        console.log("There's nothing to update.");
    } else {
        getData(data, 0, data.length);
    }
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

async function getData(_data, _start, _end) {
    if (_start === _end) {
        console.log("Successfully got all pending contracts receipts.");
    } else {

        let contract = _data[_start];
        let receipt = await web3.eth.getTransactionReceipt(contract["data"]["transactionHash"])
        let updated = await db.updateData('contracts', {
                data: {
                    transactionHash: receipt['transactionHash']
                }
            },
            {
                data: {
                    "contractAddress": receipt["contractAddress"],
                    "from": receipt["from"]
                }
            });
        _start++;
        getData(_data, _start, _end);
    }
}