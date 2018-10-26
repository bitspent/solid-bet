pragma solidity ^0.4.20;

import './Oraclize.sol';
import './Ownable.sol';
import './Pausable.sol';
import './ReentrancyGuard.sol';

/**
 * @author FadyAro 
 * 
 * 06.19.2018
 * 
 * This contract should be contructed by Its Master contract
 */
contract CryptoPriceBet is usingOraclize, Pausable, ReentrancyGuard {

    /**
     * Log BetBean State Transition 
     */
    event StateTranstition(state _old, state _new);

    /**
     * Log BetBean Subscription
     */
    event newSubscriber(address indexed addr, uint guess);

    /**
     * Log BetBean Winner(s)
     */
    event newWinner(address indexed addr, uint reward);

    /**
     *  BetBean States:
     *
     *  OPENED => still open for subscription
     *  PENDING => closed for subscription, pending execution
     *  EXECUTED => bet resolved and executed
     *  ERROR => oraclize result error
     *
     */
    enum state {OPENED, PENDING, EXECUTED, ERROR}

    /**
     *  the currency id bet subject
     *  check on https://api.coinmarketcap.com/v2/listings/
     */
    uint public currency;

    /**
     *  the bet creation time
     */
    uint public creationTime;

    /**
     *  the bet subscription closure time
     */
    uint public closureDelay;

    /**
     *  the bet result execution time
     */
    uint public executionDelay;

    /**
     *  the bet subscrition price in wei
     */
    uint256 public subscriptionPrice;

    /**
     *  the bet state
     */
    state public status = state.OPENED;

    /**
     *  the list of bet subscribers
     */
    address[] public subscribers;

    /**
     *  subscribers guesses
     */
    mapping(address => uint) public guesses;

    /**
     *  the list of bet winners
     */
    address[] public winners;

    /**
     *  the minDistance
     */
    uint public winGuess;

    /**
     *  the winner reward
     */
    uint public winReward;

    /**
     *  the subscribers counter
     */
    uint public counter;


    /**
     *  save the oraclize result
     */
    string private oraclizeResult;


    /**
     *  save the creator user
     */
    address private creator;


    /**
     * BetBean owned constructor
     *
     * deploys and activate the BetBean
     *
     */
    constructor(
        address _creator,
        uint _currency,
        uint _closureDelay,
        uint _executionDelay,
        uint256 _subscriptionPrice) public payable {

        // closureDelay should be lower than executionDelay
        require(_closureDelay < _executionDelay, 'Invalid Timing');
        creationTime = now;
        // assign the ownership to the betbean contract constructor
        owner = msg.sender;
        creator = _creator;
        currency = _currency;
        closureDelay = _closureDelay;
        executionDelay = _executionDelay;
        subscriptionPrice = _subscriptionPrice;

        // schedule bet closure
        scheduleSubscriptionClose();
    }

    /**
     * for troubleshooting - oraclize api result
     *
     */
    function result() public view returns (string) {
        return oraclizeResult;
    }

    /**
     *
     * @dev subscribe a player to the bet, submitting his price prediction
     *
     * @param guess the predicted bet currency price referred to USD
     *
     * @return the subscription count
     */
    function subscribe(uint guess) public payable nonReentrant returns (uint) {

        require
        (
        // only for users
            tx.origin == msg.sender

            // make sure the contract is in an OPENED state
            && status == state.OPENED

            // only one bet price guess per user / address
            && guesses[msg.sender] == 0

            // a guess price is mandatory
            && guess > 0

            // validate the payment amount
            && msg.value >= subscriptionPrice
        );

        // add the player
        subscribers.push(msg.sender);
        guesses[msg.sender] = guess;

        // log the event
        emit newSubscriber(msg.sender, guess);

        // increment the counter
        return ++counter;
    }

    /**
     * Case of Oraclize Failure
     */
    function recallOraclize() public nonReentrant onlyOwner {
        require(status == state.ERROR, 'Not Applicable');
        // reset state to pending execution
        emit StateTranstition(status, state.PENDING);
        status = state.PENDING;
        // re-schedule
        uint _executionDelay = executionDelay;
        executionDelay = 10;
        scheduleBetExecution();
        executionDelay = _executionDelay;
    }

    function end() public onlyOwner {
        selfdestruct(owner);
    }

    /**
     * Oraclize scheduler to end the subscription period
     */
    function scheduleSubscriptionClose() private {
        require(address(this).balance > oraclize_getPrice('URL'), 'No BGaz');
        oraclize_query(closureDelay, 'URL', '');
    }

    /**
     * Oraclize scheduler to execute the bet contract
     */
    function scheduleBetExecution() private {
        // set state to pending execution
        emit StateTranstition(status, state.PENDING);
        status = state.PENDING;
        // check balance
        require(address(this).balance > oraclize_getPrice('URL'), 'No BGaz');
        // url  : https://api.coinmarketcap.com/v2/ticker/{id}/
        // price: json(response).data.quotes.USD.price
        string memory query = 'json(https://api.coinmarketcap.com/v2/ticker/';
        string memory curp = strConcat(uint2str(currency), '/).data.quotes.USD.price');
        query = strConcat(query, curp);
        // adjust delays, closureDelay has already passed
        oraclize_query(executionDelay - closureDelay, 'URL', query);
    }

    /**
     * Absolute distance between two uints
     *
     * @return the positive distance
     */
    function dist(uint x, uint y) private pure returns (uint) {
        return (x > y ? x - y : y - x);
    }

    /**
     * End the BetBean and pay the winner(s)
     */
    function execute(string response) private {

        // validate status
        require(status == state.PENDING || status == state.ERROR, 'Invalid Status');

        // save result
        oraclizeResult = response;

        // process solution
        uint i;
        uint solution = parseInt(response, 6);

        uint distance;
        uint minDistance;

        // winners memory
        uint windex = 0;
        address[] memory wins = new address[](subscribers.length);

        // we got a solution - get the winners
        if (solution > 0) {
            // loop subscribers
            for (i = 0; i < subscribers.length; i++) {
                // get the distance with the solution
                distance = dist(guesses[subscribers[i]], solution);
                // first run assume we have the best guess
                if (i == 0)
                    minDistance = distance + 1;
                // check if we have a new minimal distance
                if (distance < minDistance) {
                    // reset winners counter
                    windex = 0;
                    // new winners list
                    wins[windex] = subscribers[i];
                    // update minDistance
                    minDistance = distance;
                    // update winner guess
                    winGuess = guesses[subscribers[i]];
                }
                // check if we have same minimal distance
                else if (distance == minDistance) {
                    wins[++windex] = subscribers[i];
                }
            }

            // reward cash-outs
            uint totalReward = subscriptionPrice * counter;
            // winners will collect 70% of the total rewards equally
            uint winnersReward = (totalReward * 70) / 100;
            uint winnerReward = winnersReward / (windex + 1);
            // fees will collect 10% of the total rewards
            uint feeReward = totalReward - winnersReward;
            // creator will take 70% of the fees
            uint creatorReward = (feeReward * 70) / 100;
            // creator will take 10% of the fees
            uint factoryReward = feeReward - creatorReward;
            // add the remaining wei
            factoryReward += address(this).balance - totalReward;

            // cash-out rewards
            owner.transfer(factoryReward);
            creator.transfer(creatorReward);
            for (i = 0; i <= windex; i++) {
                winners.push(wins[i]);
                wins[i].transfer(winnerReward);
                // log the winner
                emit newWinner(wins[i], winnerReward);
            }

            // update the win Reward
            winReward =  winnerReward;

            // finally update the BetBean status
            emit StateTranstition(status, state.EXECUTED);
            status = state.EXECUTED;
        } else {
            // error case set state FLAG
            emit StateTranstition(status, state.ERROR);
            status = state.ERROR;
        }
    }

    /**
     * first call to stop Bet subscription
     * second call to fire Bet resolution
     */
    function __callback(bytes32 myid, string res) public {

        // only Oraclize is allowed to Callback
        require(msg.sender == oraclize_cbAddress(), 'Invalid Oracle Callback');

        // no more subscription will be accepted
        if (status == state.OPENED)
            scheduleBetExecution();

        // status is pending execution
        else if (status == state.PENDING)
            execute(res);

        myid;
    }
}