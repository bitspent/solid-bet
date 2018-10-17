module.exports = (req, res, next) => {
    if (
        typeof req["body"]["account"] === 'undefined'
        || typeof req["body"]["transactionHash"] === 'undefined'
        || typeof req["body"]["id"] === 'undefined'
    ) {
        return res.json({
            success: false,
            result: "Something is missing"
        });
    }

    let id = req["body"]["id"];
    let transactionHash = req["body"]["transactionHash"];
    let account = req["body"]["account"];

    db.viewData('contracts', {
        id: id
    }, {
        category: true,
        type: true,
        id: true,
        uuid: true,
        transactionHash: true,
        to: true,
        from: true,
        time: true,
        execution_time: true
    }).then(result => {
        if (result.length === 1) {
            let contract = result[0];
            let payload = {
                category: contract['category'],
                uuid: contract['uuid'],
                execution_time: contract['execution_time'],
                betId: id,
                transactionHash: transactionHash,
                from: contract['from'],
                bettor: account,
                type: contract['type'],
                time: Math.floor(new Date().getTime() / 1000)
            };
            db.insertData('bets', payload)
                .then(res => console.log(res))
                .catch(err => console.log(err));

            return res.json({
                success: true,
                result: "Successfully pushed data."
            });
        } else {
            return res.send(error);
        }
    }).catch(error => {
        return res.send(error);
    });
};