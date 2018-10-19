r = require('rethinkdb');
db = new (require('./api/rethinkdb/Database'));

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
let contractWrapper = new (require('./api/blockchain/ContractWrapper'))(db);
var app = express();
db.initializeConnection()
    .then(async conn => {
        r.connection = conn;

        // let wrapper = require('./api/Wrapper');
        // wrapper.insertMatches('CL')
        //     .then(result => {
        //     })
        //     .catch(err => {
        //         console.log(err)
        //     });
    })
    .catch(err => {
    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes
 */
app.use('/', require('./routes/index'));
app.use('/matches', require('./routes/matches'));
app.use('/crypto', require('./routes/crypto'));
app.use('/contracts', require('./routes/contracts'));
// app.use('/bets', require('./routes/bets'));

/**
 * API endpoints
 */
app.use('/v1/matches', require('./api/endpoints/Matches'));
app.use('/v1/crypto', require('./api/endpoints/Crypto'));

app.post('/v1/contracts/add', require('./api/endpoints/Contracts').insertContract);
app.post('/v1/contracts/fetch', require('./api/endpoints/Contracts').showContract);
app.post('/v1/contracts/mine', require('./api/endpoints/Contracts').showMyContracts);
app.post('/v1/contracts/public', require('./api/endpoints/Contracts').showPublicContracts);
app.post('/v1/contracts/private', require('./api/endpoints/Contracts').showPrivateContracts);
app.post('/v1/contracts/owned', require('./api/endpoints/Contracts').showOwnedContracts);
app.post('/v1/contracts/inactive', require('./api/endpoints/Contracts').showInactiveContracts);
app.post('/v1/contracts/length', require('./api/endpoints/Contracts').showContractsLength);

app.post('/v1/bets/add', require('./api/endpoints/Bets').insertBet);
app.post('/v1/bets/inactive', require('./api/endpoints/Bets').showInactiveBets);
// app.post('/v1/bets/fetch', require('./api/endpoints/Bets').showActiveBets);
// app.post('/v1/bets/fetch', require('./api/endpoints/Bets').showBet);

setTimeout(() => {
    contractWrapper.updateContracts();
}, 2500);

setInterval(() => {
    contractWrapper.updateContracts();
}, 10 * 1000);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;