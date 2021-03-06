const express = require('express');
const expressPaginate = require('express-paginate');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const users = require('./routes/users');
const contacts = require('./routes/contact/contacts');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(expressPaginate.middleware(1, 20));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', index);
app.use('/users', users);
app.use('/contacts', contacts);

// catch 404 and forward to error handler
app.use(function (request, response, next) {
    let error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// error handler
app.use(function (error, request, response, next) {
    // set locals, only providing error in development
    response.locals.message = error.message;
    response.locals.error = request.app.get('env') === 'development' ? error : {};

    // render the error page
    response.status(error.status || 500);
    response.render('error');
    next(error);
});

module.exports = app;
