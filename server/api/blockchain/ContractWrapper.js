let Web3 = require('web3');

class ContractWrapper {
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
}


function sleep(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve(true);
        }, seconds * 1000);
    });
}

module.exports = ContractWrapper;