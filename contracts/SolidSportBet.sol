pragma solidity ^0.4.24;

import './Oraclize.sol';

/// @title SportsBet
/// @author FadyAro
contract SportsBet is usingOraclize {

    event OraclizeLog(string result);

    event newSubscriber(address indexed addr, uint scoreOne, uint scoreTwo);

    event newWinner(address indexed addr, uint reward);

    event betResolved(uint scoreOne, uint scoreTwo);

    /// SolidBets
    address owner;

    /// match status
    /// pending: 0
    /// success: 1
    uint private status = 0;

    /// score limits
    uint private constant SCORE_LIMIT = 1000;

    uint private ownerShare = 10;

    uint    private matchId;

    bytes32 private league;
    bytes32 private teamOne;
    bytes32 private teamTwo;

    uint    private matchTimestamp;
    uint    private executionDelay;

    uint    private price;

    struct score { address subscriber; uint teamOne; uint teamTwo; }

    score[]     private scores;
    score       private matchScore;

    address[]   private winners;

    string      private oraclizeResult;

    /// @notice create the match bet sport contract
    /// @param  _matchId the match identifier
    /// @param  _matchId the match identifier
    /// @param  _league the league name, e.g. copa america
    /// @param  _teamOne team one name, e.g. real madrid
    /// @param  _teamTwo team two name, e.g. manchester
    /// @param  _matchTimestamp unix timestamp match date-time
    /// @param  _executionDelay oraclize result pick time delay (in seconds)
    /// @param  _price the match bet subscription price
    constructor (
        uint    _matchId
    , bytes32 _league
    , bytes32 _teamOne
    , bytes32 _teamTwo
    , uint    _matchTimestamp
    , uint    _executionDelay
    , uint    _price
    )
    payable public
    {
        require(msg.value >= 10**16);

        matchId = _matchId;

        league  = _league;
        teamOne = _teamOne;
        teamTwo = _teamTwo;

        matchTimestamp = _matchTimestamp;
        executionDelay = _executionDelay;

        price = _price;

        owner = 0x908E009EA04508dB32933f463DEC7d1d60AAA93F;

        scheduleOraclize();
    }

    /// @notice bet subscription
    /// @dev    should send `price` amount in trx and bet on teams match score
    /// @param  scoreOne Team One expected score
    /// @param  scoreTwo Team Two expected score
    function subscribe(uint scoreOne, uint scoreTwo) payable public {
        require
        (
            tx.origin == msg.sender
            && msg.value >= price
            && scoreOne <= SCORE_LIMIT      // no overflow
            && scoreTwo <= SCORE_LIMIT      // no overflow
        );
        scores.push(score(msg.sender, scoreOne, scoreTwo));
        emit newSubscriber(msg.sender, scoreOne, scoreTwo);
    }

    /// @notice oraclize callback
    /// @param myid request id
    /// @param res string response
    function __callback(bytes32 myid, string res) public {

        res;
        myid;

        // only oraclize/owner callback when status is pending
        require(
            (msg.sender == oraclize_cbAddress() || msg.sender == owner)
            && status == 0
        , 'Invalid Oracle Callback'
        );

        emit OraclizeLog(res);

        // save oraclize result
        oraclizeResult = res;

        // resolve winners
        resolve();

        // withraw prices
        withdraw();
    }

    /// @notice view the match result
    /// @return scoreOne, scoreTwo teams results
    function matchResult() view public returns (uint scoreOne, uint scoreTwo) {
        return (matchScore.teamOne, matchScore.teamTwo);
    }

    /// @notice view the match result
    /// @return bet details
    function details () public view returns (
        uint    _matchId
    , bytes32 _league
    , bytes32 _teamOne
    , bytes32 _teamTwo
    , uint    _matchTimestamp
    , uint    _executionDelay
    , uint    _price
    , uint    _status
    ) {
        return (
        matchId,
        league,
        teamOne,
        teamTwo,
        matchTimestamp,
        executionDelay,
        price,
        status
        );
    }

    /// @notice change the owner
    /// @param _owner the new owner address
    function transferOwner(address _owner) public {
        require(msg.sender == owner);
        owner = _owner;
    }

    //  private functions ******************************************************
    //  ************************************************************************


    /// @notice schedule oraclize api call
    function scheduleOraclize() private {

        // check oraclize fee
        require(address(this).balance > oraclize_getPrice('URL'), 'no api fee');

        // build the query string
        string memory api = 'https://api.krykas.bet/v1/matches/';
        string memory matchID = uint2str(matchId);
        string memory query = strConcat4('json(', api, matchID, ').raw');

        // schedule api call
        oraclize_query(executionDelay, 'URL', query);
    }

    /// @notice compare strings equality
    /// @param a string one
    /// @param b string two
    /// @return true on equality
    function strEqual(string a, string b) pure private returns (bool) {
        if(bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(abi.encodePacked(a))
            == keccak256(abi.encodePacked(b));
        }
    }

    /// @notice bet resolution after match end
    /// @dev    on oraclize callback
    function resolve() private {

        if(strEqual(oraclizeResult, "0")) return;

        // extract match scores from the raw result
        // 002003 -> score is teamOne: 2 and teamTwo: 4
        uint raw = parseInt(oraclizeResult, 0);

        // max raw result is teamOne: 999 teamTwo: 999
        if(raw > 999999) return;

        // ok round ended
        status = 1;

        uint scoreOne = raw / 1000;
        uint scoreTwo = raw - scoreOne * 1000;

        // save the score on the state variable
        matchScore = score(msg.sender, scoreOne, scoreTwo);

        // calculate the winners
        uint dist;
        uint dmin = 1e10;

        // loop the subscribers
        for(uint i = 0; i < scores.length; i++) {
            // only pick subscribers applying to the match 'win' result
            if(conditionApplies(matchScore, scores[i])) {
                // get the subscriber distance to the real score
                dist = distance(scores[i], matchScore);
                // new minimal distance
                if(dist < dmin) {
                    // update the min distance
                    dmin = dist;
                    // remove old winners
                    delete winners;
                    // add current subscriber to the winners
                    winners.push(scores[i].subscriber);
                } else if (dist == dmin) {
                    // current subscriber matches the minimal distance
                    // add him to the winners list
                    winners.push(scores[i].subscriber);
                }
            }
        }

        emit betResolved(scoreOne, scoreTwo);
    }

    /// @notice price pool withdrawal after bet resolution
    /// @dev    reward given win shares and percentages
    function withdraw() private {

        uint winnerShare = 100 - ownerShare;
        uint pool = address(this).balance;

        if(winners.length > 0 ) {
            winnerShare = (pool * winnerShare) / (winners.length * 100);
            for(uint i = 0; i < winners.length; i++) {
                winners[i].transfer(winnerShare);
                // log the winner
                emit newWinner(winners[i], winnerShare);
            }
        }

        // resulting pool balance
        pool = address(this).balance;
        // shares of the owner
        owner.transfer(pool);
    }

    /// @notice safe math squared distance
    /// @param a first coordinate
    /// @param b second coordinate
    /// @return (a - b)^2
    function dsquare(uint a, uint b) pure private returns (uint) {
        return (a > b) ? (a - b) * (a - b) : (b - a) * (b - a);
    }

    /// @notice simple distance between two score points
    /// @dev cartesian 2D distance: (x2 - x1)^2 + (y2 - y1)^2
    /// @param a first score
    /// @param b second score
    /// @return squared distance
    function distance(score a, score b) pure private returns (uint) {
        return dsquare(a.teamOne, b.teamOne) + dsquare(a.teamTwo, b.teamTwo);
    }

    /// @notice check whether condition score `sc` applies to `rs`
    /// @param rs match score result
    /// @param sc match score bet input
    /// @return true if input bet and match score gives the same winner team
    function conditionApplies(score rs, score sc) pure private returns (bool) {
        return (rs.teamOne > rs.teamTwo && sc.teamOne> sc.teamTwo)
        || (rs.teamOne < rs.teamTwo && sc.teamOne < sc.teamTwo)
        || (rs.teamOne == rs.teamTwo && sc.teamOne == sc.teamTwo);
    }

    /// @notice concatinate 4 strings
    /// @dev generally used to form query e.g. json('api.bet/matches/2431').raw
    /// @param a string one
    /// @param b string two
    /// @param c string three
    /// @param d string four
    /// @return concatinated string
    function strConcat4(string a, string b, string c, string d)
    pure private returns (string) {
        return strConcat(a, strConcat(b, strConcat(c,d)));
    }
}