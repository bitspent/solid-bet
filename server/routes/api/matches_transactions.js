module.exports = (req, res, next) => {
    if (typeof req["body"]["account"] === 'undefined' || typeof req["body"]["transactionHash"] === 'undefined' || typeof req["body"]["matchId"] === 'undefined') {
        return res.json({
            success: false,
            result: "Something is missing"
        });
    }

    let matchId = +req["body"]["matchId"];
    let transactionHash = req["body"]["transactionHash"];
    let account = req["body"]["account"];
    let payload = {
        id: matchId,
        data: {
            transactionHash: transactionHash,
            contractAddress: null,
            to: null,
            from: account
        }
    };
    db.viewMatch(matchId)
        .then(result => {
            if (result == null) {
                db.insertTransaction(payload)
                    .then(res => console.log(res))
                    .catch(err => console.log(err));
            } else {
                db.appendTransaction(payload)
                    .then(res => console.log(res))
                    .catch(err => console.log(err));
            }
        }).catch(err => console.log(err));

    return res.json({
        success: true,
        result: "Successfully pushed data."
    });
};