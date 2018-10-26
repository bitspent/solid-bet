// https://ropsten.etherscan.io/tx/0x49ad9338d6f6c7c039bd0cfd92a22cc3c9a9612b7285c9a05813141137bbe947

let footballdata = new (require('../api/bets/sports/FootballData'));
let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
web3.eth.getTransactionReceipt('0x49ad9338d6f6c7c039bd0cfd92a22cc3c9a9612b7285c9a05813141137bbe947')
    .then(details => {
        console.log(details)
    }).catch(err => {
    console.log(err)
})

web3.eth.getTransactionReceipt('0xb5822321266d357aaaf4ece1d5f352a8b36abb0e8de0757549eaca7495353c3a')
    .then(details => {
        console.log(details)
    }).catch(err => {
    console.log(err)
})
