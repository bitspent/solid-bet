let insertContract = function (req, res, next) {
    if (
        typeof req["body"]["execution_time"] === 'undefined'
        || typeof req["body"]["account"] === 'undefined'
        || typeof req["body"]["transactionHash"] === 'undefined'
        || typeof req["body"]["uuid"] === 'undefined'
        || typeof req["body"]["category"] === 'undefined'
    ) {
        return res.json({
            success: false,
            result: "Something is missing"
        });
    }

    let uuid = +req["body"]["uuid"];
    let transactionHash = req["body"]["transactionHash"];
    let account = req["body"]["account"];
    let category = req["body"]["category"];
    let type = +req["body"]["type"];
    let execution_time = +req["body"]["execution_time"];
    let payload = {
        category: category,
        type: type,
        uuid: uuid,
        transactionHash: transactionHash,
        contractAddress: null,
        to: null,
        from: account,
        time: Math.floor(new Date().getTime() / 1000),
        execution_time: execution_time
    };
    db.insertData('contracts', payload)
        .then(res => console.log(res))
        .catch(err => console.log(err));

    return res.json({
        success: true,
        result: "Successfully pushed data."
    });
};

let showContract = function (req, res, next) {
    if (typeof req["body"]["uuid"] === 'undefined' || typeof req["body"]["id"] === 'undefined') {
        return res.json({
            success: false,
            result: "Something is missing"
        });
    }
    db.viewData('contracts', {
        uuid: +req["body"]["uuid"],
        id: req["body"]["id"],
    }, {
        category: true,
        contractAddress: true,
        id: true,
        uuid: true,
        transactionHash: true,
        to: true,
        from: true,
        time: true,
        type: true,
        execution_time: true
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
};

let showMyContracts = function (req, res, next) {
    if (
        typeof req["body"]["account"] === 'undefined'
        || typeof req["body"]["uuid"] === 'undefined'
    ) {
        return res.json({
            success: false,
            result: "Something is missing"
        });
    }

    db.viewData('contracts', function (contract) {
        let today = new Date();
        let today_timestamp = today.getTime() / 1000;
        return contract("execution_time").gt(today_timestamp)
            .and(contract("from").eq(req["body"]["account"]))
            .and(contract("uuid").eq(+req["body"]["uuid"]))
    }, {
        id: true,
        uuid: true,
        category: true,
        contractAddress: true,
        transactionHash: true,
        to: true,
        from: true,
        time: true,
        type: true,
        execution_time: true
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
};

let showPublicContracts = function (req, res, next) {
    if (
        typeof req["body"]["account"] === 'undefined'
        || typeof req["body"]["category"] === 'undefined'
    ) {
        return res.json({
            success: false,
            result: "Something is missing"
        });
    }
    db.viewData('contracts', function (contract) {
        let today = new Date();
        let today_timestamp = today.getTime() / 1000;
        return contract("execution_time").gt(today_timestamp).and(contract("type").eq(1)).and(contract('category').eq(req["body"]["category"]))
    }, {
        id: true,
        uuid: true,
        category: true,
        contractAddress: true,
        transactionHash: true,
        to: true,
        from: true,
        time: true,
        type: true,
        execution_time: true
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
};


let showPrivateContracts = function (req, res, next) {
    if (
        typeof req["body"]["account"] === 'undefined'
        || typeof req["body"]["category"] === 'undefined'
    ) {
        return res.json({
            success: false,
            result: "Something is missing"
        });
    }
    let category = req["body"]["category"];
    db.viewData('bets', function (contract) {
        let today = new Date();
        let today_timestamp = today.getTime() / 1000;
        return contract("execution_time").gt(today_timestamp).and(contract('category').eq(category)).and(contract('type').eq(2)).and(contract('from').eq(req["body"]["account"]))
    }, {
        id: true,
        betId: true,
        category: true,
        uuid: true,
        contractAddress: true,
        transactionHash: true,
        to: true,
        bettor: true,
        from: true,
        time: true,
        type: true,
        execution_time: true
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
};

let showOwnedContracts = function (req, res, next) {
    db.viewData('contracts', function (contract) {
        let today = new Date();
        let today_timestamp = today.getTime() / 1000;
        return contract("execution_time").gt(today_timestamp).and(contract("type").eq(1))
    }, {
        id: true,
        uuid: true,
        category: true,
        contractAddress: true,
        transactionHash: true,
        to: true,
        from: true,
        time: true,
        type: true,
        execution_time: true
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
};

let showInactiveContracts = function (req, res, next) {
    db.viewData('contracts', function (contract) {
        let today = new Date();
        let today_timestamp = today.getTime() / 1000;
        return contract("execution_time").lt(today_timestamp)
    }, {
        id: true,
        uuid: true,
        category: true,
        contractAddress: true,
        transactionHash: true,
        to: true,
        from: true,
        time: true,
        type: true,
        execution_time: true
    }).then(result => {
        return res.json(result);
    }).catch(error => {
        return res.send(error);
    });
};

module.exports = {
    insertContract,
    showContract,
    showMyContracts,
    showPublicContracts,
    showPrivateContracts,
    showOwnedContracts,
    showInactiveContracts
};
