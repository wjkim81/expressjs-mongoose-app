var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var passport = require('passport');
var authenticate = require('./middlewares/authenticate');
var config = require('./config');

var cors = require('cors');

var indexRouter = require('./routes/index');

// var authRouter = require('./routes/web/authRouter');
// var mobileAuthRouter = require('./routes/mobile/authRouter');

// var orgRouter = require('./routes/orgRouter');
// var membersRouter = require('./routes/memberRouter');
// var patientRouter = require('./routes/web/patientRouter');
// var adminRouter = require('./routes/web/adminRouter');
// var uploadRouter = require('./routes/web/uploadRouter');

var mobileRouter = require('./routes/mobile');
// var webRouter = require('./routes/web');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connection URL
const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then((db) => {
  var db = mongoose.connection;
  console.log("Connected correctly to server");

}, (err) => { console.log(err); });



var app = express();

// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: '50mb'}));
//app.use(express.urlencoded({extended: false, limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false, parameterLimit: 1000000}));


//app.use(cookieParser());

app.use(passport.initialize());

app.use('*', (req, res, next) => {
  console.log('req.headers.authorization: ', req.headers.authorization);
  next();
})

//app.use('/users', usersRouter);
// app.use('/auth', authRouter);
// app.use('/mobile/auth', mobileAuthRouter);
//app.use('/members', memberRouter);


app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({origin: 'http://localhost:4200'}));


// app.use('/organizations', orgRouter);
// app.use('/members', membersRouter);
// app.use('/patients', patientRouter);
// app.use('/admins', adminRouter);
// app.use('/imageUpload', uploadRouter);

app.use('/mobile', mobileRouter);
app.use('/', indexRouter); // indexRouter has all routers for web


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(`err: ${err}`)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
