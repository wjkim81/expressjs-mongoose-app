var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var Member = require('../models/members');
var MobileMember = require('../models/mobileMembers');
var config = require('../config');

exports.web = passport.use('webLocal', new LocalStrategy({session: false}, Member.authenticate()));
exports.mobile = passport.use('mobileLocal', new LocalStrategy({session: false}, MobileMember.authenticate()));

passport.serializeUser((user, done) => {
  if (user.usertype === 'web') {
    console.log('web serialize');
    done(Member.serializeUser());
  } else {
    console.log('mobile serialize');
    done(MobileMember.serializeUser());
  }
});
passport.deserializeUser((user, done) => {
  if (user.usertype === 'web') {
    console.log('web deserialize');
    done(Member.deserializeUser());
  } else {
    console.log('mobile deserialize');
    done(MobileMember.deserializeUser());
  }
});

exports.getToken = function(member) {
  return jwt.sign(member, config.secretKey, {expiresIn: 60*60*24*365});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use('webjwt', new JwtStrategy(opts,
(jwt_payload, done) => {
  console.log("Web JWT payload: ", jwt_payload);

  Member.findOne({_id: jwt_payload._id})
  .populate('organization')
  .then((member) => {
    console.log('web jwt strategy')
    console.log(member)
    if (member)
      return done(null, member);
    else
      return done(null, false);
  }, (err) => {
    return done(err, false);
  });
}));

exports.mobileJwtPassport = passport.use('mobilejwt', new JwtStrategy(opts,
  (jwt_payload, done) => {
  console.log("Mobile JWT payload: ", jwt_payload);

  MobileMember.findOne({_id: jwt_payload._id})
  .populate('patient')
  .then((mobileMember) => {
    console.log('mobile jwt strategy')
    console.log(mobileMember)
    if (mobileMember)
      return done(null, mobileMember);
    else
      return done(null, false);
  }, (err) => {
    return done(err, false);
  });
}));

exports.verifyMember = passport.authenticate('webjwt', {session: false});

exports.verifyAdmin = function(req, res, next) {
  console.log(`req.user.admin: ${req.user.admin}`);
  
  if (req.user.admin) {
    next();
  } else {
    var err = new Error('You are not authorized to perform this operation!');
    err.status = 403;
    next(err);
  }
}

exports.verifyMobileMember = passport.authenticate('mobilejwt', {session: false});