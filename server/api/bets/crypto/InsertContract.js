module.exports = (req, res, next) => {
    if (typeof req["body"]["account"] === 'undefined' || typeof req["body"]["transactionHash"] === 'undefined' || typeof req["body"]["currencyId"] === 'undefined') {
        return res.json({
            success: false,
            result: "Something is missing"
        });
    }

    let currencyId = +req["body"]["currencyId"];
    let transactionHash = req["body"]["transactionHash"];
    let account = req["body"]["account"];
    let payload = {
        data: {
            currencyId: currencyId,
            transactionHash: transactionHash,
            contractAddress: null,
            to: null,
            from: account
        }
    };
    db.insertData('contracts', payload)
        .then(res => console.log(res))
        .catch(err => console.log(err));

    return res.json({
        success: true,
        result: "Successfully pushed data."
    });
};