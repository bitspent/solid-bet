// https://ropsten.etherscan.io/tx/0x49ad9338d6f6c7c039bd0cfd92a22cc3c9a9612b7285c9a05813141137bbe947

let footballdata = new (require('../api/bets/sports/FootballData'));
let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws')); 

web3.eth.getTransactionReceipt('0xb78008432a7c224ca798ac54fc376bca9a26508dc753b55a7a9accce572971e6')
    .then(details => {
        console.log(details)
    }).catch(err => {
    console.log(err)
})


web3.eth.getTransactionReceipt('0x43e59beec44e5458c595ca2c75c433218c17d7dc4f7f9e89e151dcc205e37483')
    .then(details => {
        console.log(details)
    }).catch(err => {
    console.log(err)
})
