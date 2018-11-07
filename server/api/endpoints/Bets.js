let insertBet = function(req, res, next) {
  if (
    typeof req["body"]["account"] === "undefined" ||
    typeof req["body"]["transactionHash"] === "undefined" ||
    typeof req["body"]["id"] === "undefined"
  ) {
    return res.json({
      success: false,
      result: "Something is missing"
    });
  }

  let id = req["body"]["id"];
  let transactionHash = req["body"]["transactionHash"];
  let account = req["body"]["account"];

  db.viewData(
    "contracts",
    {
      id: id
    },
    {
      category: true,
      type: true,
      id: true,
      uuid: true,
      transactionHash: true,
      to: true,
      from: true,
      time: true,
      execution_time: true,
      subscription_price: true,
      checked: true
    }
  )
    .then(result => {
      if (result.length === 1) {
        let contract = result[0];
        let payload = {
          category: contract["category"],
          uuid: contract["uuid"],
          execution_time: contract["execution_time"],
          betId: id,
          transactionHash: transactionHash,
          from: contract["from"],
          bettor: account,
          type: contract["type"],
          time: Math.floor(new Date().getTime() / 1000),
          subscription_price: contract["subscription_price"],
          checked: contract["checked"]
        };
        db.insertData("bets", payload)
          .then(res => console.log(res))
          .catch(err => console.log(err));

        return res.json({
          success: true,
          result: "Successfully pushed data."
        });
      } else {
        return res.send(error);
      }
    })
    .catch(error => {
      return res.send(error);
    });
};

let showInactiveBets = function(req, res, next) {
  db.viewData(
    "bets",
    function(contract) {
      let today = new Date();
      let today_timestamp = today.getTime() / 1000;
      return contract("execution_time").lt(today_timestamp);
    },
    {
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
      execution_time: true,
      subscription_price: true,
      checked: true
    }
  )
    .then(result => {
      return res.json(result);
    })
    .catch(error => {
      return res.send(error);
    });
};

let showOwnedInactiveBets = function(req, res, next) {
  if (typeof req["body"]["account"] === "undefined") {
    return res.json({
      success: false,
      result: "Something is missing"
    });
  }
  let category = req["body"]["category"];
  db.viewData(
    "bets",
    function(contract) {
      let today = new Date();
      let today_timestamp = today.getTime() / 1000;
      return contract("execution_time")
        .lt(today_timestamp)
        .and(
          contract("bettor")
            .eq(req["body"]["account"])
            .or(contract("from").eq(req["body"]["account"]))
        );
    },
    {
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
      execution_time: true,
      subscription_price: true,
      checked: true
    }
  )
    .then(result => {
      return res.json(result);
    })
    .catch(error => {
      return res.send(error);
    });
};

module.exports = {
  insertBet,
  showInactiveBets,
  showOwnedInactiveBets
};
