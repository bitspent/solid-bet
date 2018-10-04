Solid Bet
API Draft
Intro
Starting the Sports / Football bets
Refer to https://www.football-data.org/documentation/samples
Register account and get API key
Use this API to 
Fetch upcoming football matches within a league
Fetch matches details and scores
Neom Bet Api
Neom Internal Normalized API will provide the matches details for the smart contracts
Given that Sportsbet Smart Contract will not access directly external data api
Instead Neom Backend will collect matches and manage data from external(s) api(s)
Neom API will expose the details in a normalized response for the ORACLIZE


Match Details Request
To get a match details: league, teams, match status, match time, scores we need an API like:
https://api.neom.bet/v1/matches/{matchId}
Path Variable {matchId} is the match unique integer identifier
Neom Backend will be managing upcoming matches in a database with an assigned matchId
JSON Response: 
{
	league : ‘champions league’
	, timestamp : 1537436418
	, status : ‘ended’
	, teamOne :  { name : ‘juventus’, score : 2 }
	, teamTwo :  { name : real madrid’, score : 3 }
	, raw : ‘002003’
}
Most important part for the oraclize in the smart contract is ‘raw’ property
If the match status is not ‘ended’ then raw should be exactly ‘0’
If the match status is ended then it will reflect {Team One}{Team Two} scores
The raw team score parts should be of length 3 left padded with zeros
E.g. 
	Team One score 0 and Team Two score 2 => raw : ‘000002’
	Team One score 3 and Team Two score 1 => raw : ‘003001’

