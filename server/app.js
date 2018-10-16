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
app.use('/sports', require('./routes/sports'));
app.use('/crypto', require('./routes/crypto'));

/**
 * API endpoints
 */
app.use('/v1/sports', require('./api/endpoints/bets/sports/Matches'));
app.use('/v1/crypto', require('./api/endpoints/bets/crypto/Crypto'));
app.post('/v1/sports', require('./api/bets/sports/InsertContract'));
app.post('/v1/crypto', require('./api/bets/crypto/InsertContract'));


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