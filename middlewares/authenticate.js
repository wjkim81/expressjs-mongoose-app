var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var Member = require('../models/members');
var config = require('../config');

exports.local = passport.use(new LocalStrategy({session: false}, Member.authenticate()));
passport.serializeUser(Member.serializeUser());
passport.deserializeUser(Member.deserializeUser());

exports.getToken = function(member) {
  return jwt.sign(member, config.secretKey, {expiresIn: 60*60*24*30});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
  (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    Member.findOne({_id: jwt_payload._id}, (err, member) => {
      if (err) {
        return done(err, false);
      }
      else if (member) {
        return done(null, member);
      }
      else {
        return done(null, false);
      }
    });
  }));

exports.verifyMember = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = function(req, res, next) {
  console.log(`req.member.admin: ${req.member.admin}`);
  
  if (req.member.admin) {
    next();
  } else {
    var err = new Error('You are not authorized to perform this operation!');
    err.status = 403;
    next(err);
  }
}