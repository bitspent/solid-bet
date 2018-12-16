let base_url = "http://neom.bet:3000";
var socket = io("http://neom.bet:3001");

socket.on("connect", function () {
  console.log("Successfully conncted to socket.io server");
});
socket.on("TXS_UPDATES", function (data) {
  // console.log(data);
  if (App.account === data["from"]) {
    $("#addTickerModal").modal("hide");
    $("#solidBetTransactionModal").modal({
      keyboard: false,
      show: true
    });

    let deployed_contract_content = ``;
    if (!data["status"]) {
      deployed_contract_content += `Failed to deploy contract address.`;
    }

    if (data["status"]) {
      let link = `https://ropsten.etherscan.io/address/${
        data["contractAddress"]
        }`;
      let local_link = `${base_url}/contracts/${data["uuid"]}/${data["id"]}`;
      let display_text =
        data["category"] === "sports"
          ? `game ${data["uuid"]}`
          : `currency: ${App.tickers_data[data["uuid"]].name}`;

      deployed_contract_content += `Successfully created and deployed contract for ${display_text}.<br/>`;
      deployed_contract_content += `Check your contract on the ropsten network <a href="${link}" target="_blank">here</a><br/>`;
      deployed_contract_content += `Check your deployed contract bet by clicking <a href="${local_link}" target="_blank">here</a><br/>`;
    }
    $("#solidBetTransactionModalBody").html(deployed_contract_content);
  }
});

socket.on("disconnect", function () { });

App = {
  web3Provider: null,
  account: null,
  MatchInstance: null,
  MatchInstancePrice: null,

  CryptoInstance: null,
  CryptoInstancePrice: null,

  matches: {},
  currencyId: null,
  matchId: null,
  getAccount: function () {
    return new Promise((resolve, reject) => {
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          return reject(error);
        } else {
          return resolve(accounts[0]);
        }
      });
    });
  },

  initWeb3: function () {
    return new Promise((resolve, reject) => {
      if (typeof web3 !== "undefined") {
        App.web3Provider = web3.currentProvider;
      } else {
        App.web3Provider = new Web3.providers.HttpProvider(
          "http://localhost:8545"
        );
        alert("Please install Metamask before proceeding.");
        return;
      }
      web3 = new Web3(App.web3Provider);
      if (web3 == null || typeof web3 === "undefined") {
        return reject("Something went wrong");
      } else {
        return resolve("Successfully connected to Web3 Provider.");
      }
    });
  },

  createMatchesBetContract: function () {
    let temp_match_id = App.matchId;
    let current_data = {};
    let match = App.matches[+App.matchId];
    let price = $("#subscription_price").val();
    let visibility_flag = $("#visibility_flag option:selected").val();
    let _league = match["league"];
    let _teamOne = match["homeTeam"]["name"];
    let _teamTwo = match["awayTeam"]["name"];
    let _matchTimestamp = Math.floor(
      new Date(match["utcDate"]).getTime() / 1000
    );
    let _executionDelay = _matchTimestamp + 3 * 60 * 60;
    let _price = +price * 1e18;
    console.log(
      +App.matchId,
      _league,
      _teamOne,
      _teamTwo,
      _matchTimestamp,
      _executionDelay,
      _price
    );
    var SolidSportBet = web3.eth.contract(App.SOLID_SPORT_BET_ABI);
    var SolidSportBetInstance = SolidSportBet.new(
      +App.matchId,
      _league,
      _teamOne,
      _teamTwo,
      _matchTimestamp,
      _executionDelay,
      _price,
      {
        from: App.account,
        value: 0.1 * 1e18,
        data: App.SOLID_SPORT_BET_DATA,
        gas: "4700000"
      },

      function (err, deployedContract) {
        if (!err) {
          if (!deployedContract.address) {
            console.log(deployedContract["transactionHash"]);
            $("#addMatchModal").modal("hide");
            $("#solidBetTransactionModal").modal({
              keyboard: false,
              show: true
            });

            $.ajax({
              method: "POST",
              contentType: "application/json",
              url: base_url + "/v1/contracts/add",
              data: JSON.stringify({
                account: App.account,
                type: +visibility_flag,
                uuid: +App.matchId,
                category: "sports",
                transactionHash: deployedContract["transactionHash"],
                execution_time: Math.floor(
                  new Date(match["utcDate"]).getTime() / 1000
                ),
                subscription_price: _price
              }),
              success: function (data, textStatus, jqXHR) {
                current_data = data;
                if (data["success"]) {
                  let content = "";
                  let link = `https://ropsten.etherscan.io/tx/${
                    deployedContract["transactionHash"]
                    }`;
                  content += `Track your transaction by clicking <a href="${link}" target="_blank">here</a>`;
                  $("#solidBetTransactionModalBody").html(content);
                }
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.log("Failed to post data.");
              }
            });
          }
        } else {
          console.log(err);
        }
      }
    );
  },

  getMatches: function () {
    return new Promise((resolve, reject) => {
      $.ajax({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "GET",
        url: base_url + "/v1/matches",
        success: function (data, textStatus, jqXHR) {
          return resolve(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          return reject(errorThrown);
        }
      });
    });
  },

  displayMatches: async () => {
    let c_length = await App.getContractsLength("sports");
    let data = await App.getMatches();
    App.matches = data;
    if (data && data.length > 0) {
      data.sort(function (a, b) {
        var nameA = a["league"].toUpperCase(); // ignore upper and lowercase
        var nameB = b["league"].toUpperCase(); // ignore upper and lowercase
        if (nameA > nameB) {
          return -1;
        }
        if (nameA < nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });

      data.forEach(match => {
        let disabled =
          typeof c_length[match["id"]] === "undefined" ? "disabled" : "";
        let timestamp = new Date(match["utcDate"]).getTime();
        App.matches[match.id] = match;
        let content = `<tr>`;

        content += `<td>${match["league"]}</td>`;
        content += `<td>[<b>${match["id"]}</b>] ${
          match["homeTeam"]["name"]
          } vs ${match["awayTeam"]["name"]}</td>`;
        content += `<td style="word-wrap: break-word">${formatTime(
          timestamp
        )}</td>`;
        content += `<td><a href="${base_url}/matches/${
          match["id"]
          }" target="_blank"><button type="button" class="btn btn-primary">View</button></a></td>`;
        content += `<td><a href="${base_url}/contracts/${
          match["id"]
          }" target="_blank"><button type="button" class="btn btn-primary" ${disabled}>View</button></a></td>`;
        content += `<td><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#addMatchModal" onclick="App.matchId=${
          match["id"]
          }">Create</button></td>`;
        content += ` < /tr>`;
        $("#upcoming_matches_table").prepend(content);
      });
    }
  },

  getContract: function (uuid, betId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        contentType: "application/json",
        url: base_url + "/v1/contracts/fetch",
        data: {
          account: App.account,
          uuid: uuid,
          id: betId
        },
        success: function (_data, textStatus, jqXHR) {
          if (_data.length === 1) {
            return resolve(_data[0]);
          } else {
            return reject("");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          return reject(errorThrown);
        }
      });
    });
  },

  displayContract: async (uuid, betId) => {
    let data = await App.getContract(uuid, betId);
    // console.log(data)
    if (data["status"]) {
      if (data["category"] === "sports") {
        /**
         * Match
         */
        let MatchContract = web3.eth.contract(App.SOLID_SPORT_BET_ABI);
        App.MatchInstance = MatchContract.at(data["contractAddress"]);
        let states = ["PENDING", "SUCCESS"];
        App.MatchInstance.details(function (err, res) {
          if (!err) {
            App.MatchInstancePrice = res[6].valueOf();
            let _matchId = res[0];
            let _league = web3.toAscii(res[1]);
            let _teamOne = web3.toAscii(res[2]);
            let _teamTwo = web3.toAscii(res[3]);
            let _matchTimestamp = res[4].valueOf() * 1000;
            let _executionDelay = res[5].valueOf() * 1000;
            App.execution_time = res[5].valueOf();
            let _price = res[6].valueOf() / 1e18;
            let _status = res[7];
            let content = "";
            content += `<b>Contract address</b>: <a href="https://ropsten.etherscan.io/address/${
              data["contractAddress"]
              }" target="_blank">${data["contractAddress"]}</a><br/>`;
            content += `<b>Match #</b>: ${_matchId}<br/>`;
            content += `<b>Bet #</b>: ${betId}<br/>`;
            content += `<b>League</b>: ${_league}<br/>`;
            content += `<b>Team one</b>: ${_teamOne}<br/>`;
            content += `<b>Team two</b>: ${_teamTwo}<br/>`;
            content += `<b>Time</b>: ${formatTime(_matchTimestamp)}<br/>`;
            content += `<b>Execution delay</b>: ${formatTime(
              _executionDelay
            )}<br/>`;
            content += `<b>Price</b>: ${_price} ETH <br/>`;
            content += `<b>Status</b>: ${states[_status]}<br/>`;
            $("#bet_details").html(content);
          }
        });

        let MATCH_SUBS = App.MatchInstance.newSubscriber(
          {
            // address: App.account
          },
          {
            fromBlock: 0,
            toBlock: "latest"
          }
        );

        MATCH_SUBS.watch(function (error, event) {
          if (!error) {
            let result = event["args"];
            let content = `<tr>`;
            content += `<td>${result["addr"]}</td>`;
            content += `<td>${result["scoreOne"]}</td>`;
            content += `<td>${result["scoreTwo"]}</td>`;
            content += `</tr>`;
            $("#bet_subscribers").prepend(content);
            // console.log(event);
          }
        });

        let MATCH_WIN_RESULT = App.MatchInstance.betResolved(
          {
            // address: App.account
          },
          {
            fromBlock: 0,
            toBlock: "latest"
          }
        );

        MATCH_WIN_RESULT.watch(function (error, event) {
          if (!error) {
            let result = event["args"];
            let scoreOne = result["scoreOne"].valueOf();
            let scoreTwo = result["scoreTwo"].valueOf();
            let content = ``;
            content += `<b>Score one</b>: ${scoreOne}<br/>`;
            content += `<b>Score two</b>: ${scoreTwo}`;
            $("#result_details").html(content);
          }
        });
      }
    }
  },

  subscribeMatchContract: function () {
    let inputTeamScoreOne = $("#inputTeamScoreOne").val();
    let inputTeamScoreTwo = $("#inputTeamScoreTwo").val();
    App.MatchInstance.subscribe(
      inputTeamScoreOne,
      inputTeamScoreTwo,
      {
        value: App.MatchInstancePrice,
        from: App.account
      },
      function (err, res) {
        if (err) {
          console.log(err);
        } else {
          $.ajax({
            method: "POST",
            contentType: "application/json",
            url: base_url + "/v1/bets/add",
            data: JSON.stringify({
              id: App.betId,
              category: "matches",
              account: App.account,
              transactionHash: res,
              contractAddress: App.MatchInstance.address,
              execution_time: App.execution_time
            }),
            success: function (data, textStatus, jqXHR) {
              let content = "";
              let link = `https://ropsten.etherscan.io/tx/${res}`;
              content += `Successfully subscribed for match: ${+App.matchId}<br/>`;
              content += `Track your transaction on the ropsten network by clicking <a href="${link}" target="_blank">here</a>`;
              $("#solidBetTransactionModalBody").html(content);
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.log("Failed to post data.");
            }
          });
        }
      }
    );
  },

  getAvailableBets: async category => {
    // console.log(category)
    let public_bets = await App.getBets(category, "public");
    console.log(public_bets)
    public_bets.forEach(element => {
      appendBet(element)
    });
  },

  getMySubscriptions: async category => {
    // console.log(category)
    let private_bets = await App.getBets(category, "private");
    console.log(private_bets);
  },

  getBets: async (category, type) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        contentType: "application/json",
        url: base_url + `/v1/contracts/${type}`,
        data: {
          account: App.account,
          category: category
        },
        success: function (data, textStatus, jqXHR) {
          return resolve(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          return reject(errorThrown);
        }
      });
    });
  },

  getInactiveBets: function () {
    $("#bets").html("");
    $.ajax({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      contentType: "application/json",
      url: base_url + "/v1/contracts/inactive/all",
      data: {
        account: App.account
      },
      success: function (data, textStatus, jqXHR) {
        if (data && data.length > 0) {
          data.forEach(contract => {
            let type = contract["type"] === 1 ? "public" : "private";

            let status = "";
            if (contract["checked"] === false && contract["status"] === false) {
              status = "pending";
            } else if (
              contract["checked"] === true &&
              contract["status"] === true
            ) {
              status = "deployed";
            } else if (
              contract["checked"] === true &&
              contract["status"] === false
            ) {
              status = "failed";
            }

            // let category = contract['category'];
            let content = "";
            content += `<tr>`;
            content += `<td>${contract["id"]}</td>`;
            content += `<td>${type}</td>`;
            content += `<td>${status}</td>`;
            content += `<td>${contract["category"]}</td>`;
            content += `<td>contract</td>`;
            content += `<td>${formatTime(
              contract["execution_time"] * 1000
            )}</td>`;
            content += `<td><a href="${base_url}/contracts/${
              contract["uuid"]
              }/${contract["id"]}" target="_blank">here</a></td>`;
            content += `</tr>`;
            $("#bets").prepend(content);
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });

    $.ajax({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      contentType: "application/json",
      url: base_url + "/v1/bets/inactive/all",
      data: {
        account: App.account
      },
      success: function (data, textStatus, jqXHR) {
        if (data && data.length > 0) {
          data.forEach(contract => {
            let type = contract["type"] === 1 ? "public" : "private";
            let status = "";
            if (contract["checked"] === false && contract["status"] === false) {
              status = "pending";
            } else if (
              contract["checked"] === true &&
              contract["status"] === true
            ) {
              status = "deployed";
            } else if (
              contract["checked"] === true &&
              contract["status"] === false
            ) {
              status = "failed";
            }
            let content = "";
            content += `<tr>`;
            content += `<td>${contract["betId"]}</td>`;
            content += `<td>${type}</td>`;
            content += `<td>${status}</td>`;
            content += `<td>${contract["category"]}</td>`;
            content += `<td>subscription</td>`;
            content += `<td>${formatTime(
              contract["execution_time"] * 1000
            )}</td>`;
            content += `<td><a href="${base_url}/contracts/${
              contract["uuid"]
              }/${contract["betId"]}" target="_blank">here</a></td>`;
            content += `</tr>`;
            $("#bets").prepend(content);
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  },

  getOwnedInactiveBets: function () {
    $("#bets").html("");
    $.ajax({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      contentType: "application/json",
      url: base_url + "/v1/contracts/inactive/mine",
      data: {
        account: App.account
      },
      success: function (data, textStatus, jqXHR) {
        if (data && data.length > 0) {
          data.forEach(contract => {
            let type = contract["type"] === 1 ? "public" : "private";
            let status = "";
            if (contract["checked"] === false && contract["status"] === false) {
              status = "pending";
            } else if (
              contract["checked"] === true &&
              contract["status"] === true
            ) {
              status = "deployed";
            } else if (
              contract["checked"] === true &&
              contract["status"] === false
            ) {
              status = "failed";
            }
            let content = "";
            content += `<tr>`;
            content += `<td>${contract["id"]}</td>`;
            content += `<td>${type}</td>`;
            content += `<td>${status}</td>`;
            content += `<td>${contract["category"]}</td>`;
            content += `<td>contract</td>`;
            content += `<td>${formatTime(
              contract["execution_time"] * 1000
            )}</td>`;
            content += `<td><a href="${base_url}/contracts/${
              contract["uuid"]
              }/${contract["id"]}" target="_blank">here</a></td>`;
            content += `</tr>`;
            $("#bets").prepend(content);
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });

    $.ajax({
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      contentType: "application/json",
      url: base_url + "/v1/bets/inactive/mine",
      data: {
        account: App.account
      },
      success: function (data, textStatus, jqXHR) {
        if (data && data.length > 0) {
          data.forEach(contract => {
            let type = contract["type"] === 1 ? "public" : "private";
            let content = "";
            let status = "";
            if (contract["checked"] === false && contract["status"] === false) {
              status = "pending";
            } else if (
              contract["checked"] === true &&
              contract["status"] === true
            ) {
              status = "deployed";
            } else if (
              contract["checked"] === true &&
              contract["status"] === false
            ) {
              status = "failed";
            }
            content += `<tr>`;
            content += `<td>${contract["betId"]}</td>`;
            content += `<td>${type}</td>`;
            content += `<td>${status}</td>`;
            content += `<td>${contract["category"]}</td>`;
            content += `<td>subscription</td>`;
            content += `<td>${formatTime(
              contract["execution_time"] * 1000
            )}</td>`;
            content += `<td><a href="${base_url}/contracts/${
              contract["uuid"]
              }/${contract["betId"]}" target="_blank">here</a></td>`;
            content += `</tr>`;
            $("#bets").prepend(content);
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  },

  load: async () => {
    App.account = await App.getAccount();
    console.log("Successfully loaded web3 and all related data.");
  },

  getTickersData: async () => {
    let _data = await $.getJSON(`${base_url}/ticker.json`);
    App.tickers_data = _data["data"];
    console.log("Successfully loaded tickers data.");
  },

  getABIs: async () => {
    let sports = await $.getJSON(`${base_url}/sports.json`);
    let crypto = await $.getJSON(`${base_url}/crypto.json`);

    let sports_data = await $.getJSON(`${base_url}/sports_data.json`);
    let crypto_data = await $.getJSON(`${base_url}/crypto_data.json`);

    App.SOLID_SPORT_BET_ABI = sports["abi"];
    App.SOLID_CRYPTO_BET_ABI = crypto["abi"];
    App.SOLID_SPORT_BET_DATA = sports_data["data"];
    App.SOLID_CRYPTO_BET_DATA = crypto_data["data"];
    console.log("Successfully loaded ABIs.");
  },

  getHistory: async () => {
    let history_flag = $("#history_flag option:selected").val();
    if (history_flag == 1) {
      await App.getInactiveBets();
    } else {
      await App.getOwnedInactiveBets();
    }
  }
};

$("#solidBetTransactionModal").on("hidden.bs.modal", function (e) {
  $("#solidBetTransactionModalBody").html("");
});

$("#addTickerModal").on("hidden.bs.modal", function (e) {
  App.currencyId = null;
});

$("#addMatchModal").on("hidden.bs.modal", function (e) {
  App.matchId = null;
});

onload = async () => {
  await App.getABIs();
  await App.getTickersData();
  await App.initWeb3();
  await App.load();

  $(document).on(
    "click",
    "#subscribe_sports_button",
    App.subscribeMatchContract
  );


  $(document).on("click", "#add_sports_button", App.createMatchesBetContract);
  $(document).on("click", "#fetch_bets_button", App.getBets);
  $(document).on("click", "#display_history_button", App.getHistory);

  $("#crypto").height($(window).height());
  $("#sports").height($(window).height());
  let pathname = window.location.pathname;
  let link = window.location.href;
  let splitted = link.replace(base_url, "");
  splitted = splitted.split("/");
  splitted = splitted.filter(element => element !== "");
  let fetched_matches = await App.getMatches();
  let matches = fetched_matches.map(match => App.matches[+match.id] = match);
  if (splitted.length === 3 && splitted[2] === "sports") {
    await App.getAvailableBets("sports");
    await App.getMySubscriptions("sports");
  }

  if (splitted.length === 2 && splitted[1] === "history") {
    // App.getInactiveBets();
    // App.getOwnedInactiveBets();
  }

  if (
    splitted.length === 3 &&
    splitted[1] === "contracts" &&
    !isNaN(+splitted[2])
  ) {
    await App.getContracts(+splitted[2]);
  }

  if (
    splitted.length === 3 &&
    splitted[1] === "matches" &&
    !isNaN(+splitted[2])
  ) {
    await App.getMatchDetails(+splitted[2]);
  }

  if (
    splitted.length === 4 &&
    splitted[1] === "contracts" &&
    !isNaN(+splitted[2])
  ) {
    await App.displayContract(+splitted[2], splitted[3]);
    App.uuid = +splitted[2];
    App.betId = splitted[3];
  }
};

function openPage(path) {
  window.location.replace(`${base_url}/${path}`);
}

function formatTime(_timestamp) {
  let current_date = new Date(_timestamp);
  return `${current_date.getUTCDate()}-${current_date.getUTCMonth() +
    1}-${current_date.getFullYear()} ${current_date.toLocaleTimeString()}`;
}

function formatTimeInput(_timestamp) {
  let current_date = new Date(_timestamp);
  return `${current_date.getFullYear()}-${current_date.getUTCMonth() +
    1}-${current_date.getUTCDate()}T${fixTwo(current_date.getHours())}:${fixTwo(
      current_date.getUTCMinutes()
    )}`;
}

function fixTwo(number) {
  if (number < 10) {
    return "0" + number;
  } else {
    return number;
  }
}

function formatHours(_timestamp) {
  let hours = _timestamp / (60 * 60);
  return `${hours.toFixed(2)} h`;
}


function openModal(modal) {
  $(modal).modal({
    keyboard: false,
    show: true,
    // backdrop: 'static',
  });
}

function toHex(s) {
  var hex = "";
  for (var i = 0; i < s.length; i++) {
    hex += "" + s.charCodeAt(i).toString(16);
  }
  return `0x${hex}`;
}

function waitSeconds(seconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

function dateToSeconds(current_date) {
  return Math.floor(new Date(current_date).getTime() / 1000);
}


function appendBet(bet) {
  console.log(App.matches[bet.uuid])
  let match = App.matches[bet.uuid];
  let content = ``;
  content += `<div class="col-md-3 pr">`;
  content += `<div class="my-card bg-vs">`;
  content += `<div class="row">`;
  content += `<div class="col-md-12">`;
  content += `<div class="p-20">`;
  // content += `<img src="img/live.png" class="small-logo">`;
  // content += `<img src="img/nba.png" class="small-logo">`;
  content += `<span class="team-text">${match.league}</span>`;
  // content += `<span class="gray-text">Football</span>`;
  content += `</div>`;
  content += `</div>`;
  content += `</div>`;
  content += `<div class="row">`;
  content += `<div class="col-md-12">`;
  content += `<div class="left-logo">`;
  // content += `<img src="img/okc.jpg" class="team-logo">`;
  content += `<p class="team-text">${match.homeTeam.name}</p>`;
  // content += `<span class="team-name">Thunder</span><br>`;
  // content += `<span class="team-value">117</span><br>`;
  // content += `<span class="team-rate"><span><img style="width: 11px;" src="img/menu.png"></span>0.00</span><br>`;

  content += `</div>`;
  content += `<div class="right-logo">`;
  // content += `<img src="img/jazz.png" class="team-logo">`;
  content += `<p class="team-text">${match.awayTeam.name}</p>`;
  // content += `<span class="team-name">Jazz</span><br>`;
  // content += `<span class="team-value">108</span><br>`;
  // content += `<span class="team-rate"><span><img style="width: 11px;" src="img/menu.png"></span>0.02</span><br>`;
  content += `</div>`;

  content += `</div>`;
  content += `</div>`;
  content += `<div class="row" style='margin-top: 20% !important'>`;
  content += `<div class="col-md-12">`;
  content += `<div class="bid-div">`;
  content += `<button class="bid-btn" onclick="alert(11)"; style="font-size: 16px !important">BID</button>`;
  content += `<br>`;
  content += `<span class="team-text">stats</span>`;
  content += `</div>`;
  content += `<div class="card-text">`;
  content += `<span class="team-rate" style='font-size:15px !important'>Open&nbsp;&nbsp;</span> - `;
  content += `<span class="team-rate" style='font-size:15px !important'>${bet.subscription_price/1e18} ETH</span>`;
  content += `</div>`;
  content += `</div>`;
  content += `</div>`;
  content += `</div>`;
  content += `</div>`;
  content += `<br class="hidden-lg hidden-md"></br>`;
  $("#displayable_bets").append(content);
}

setTimeout(() => {
  // openModal('#');
  $('#myModal').modal({
    keyboard: false,
    show: true,
    // backdrop: 'static',
  });
}, 2500);