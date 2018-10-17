module.exports = (req, res, next) => {
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