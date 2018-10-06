r = require('rethinkdb');
db = new (require('./api/rethinkdb/Database'));

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

db.initializeConnection()
    .then(async conn => {
        r.connection = conn;

        // let wrapper = require('./api/Wrapper');
        //
        // wrapper.insertMatches('CL').then(result => {
        //     console.log(result);
        // }).catch(err => {
        //     console.log(err)
        // });

    })
    .catch(err => {
    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes
 */
app.use('/', require('./routes/index'));
app.use('/matches', require('./routes/matches'));

/**
 * API endpoints
 */
app.use('/v1/matches', require('./api/matches/Matches'));
app.post('/v1/matches', require('./api/matches/InsertContract'));

setTimeout(() => {
    require('./api/blockchain/ContractWrapper');
}, 2500);
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
