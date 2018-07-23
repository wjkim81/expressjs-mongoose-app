var express = require('express');
const bodyParser = require('body-parser');

var passport = require('passport');

const MobileMembers = require('../../models/mobileMembers');
const Patients = require('../../models/patients');

var authenticate = require('../../middlewares/authenticate');
var cors = require('../cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET mobile member listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });

router.post('/signup', cors.corsWithOptions,
(req, res, next) => {

  MobileMembers.register(new MobileMembers({username: req.body.username}), 
    req.body.password, (err, mobileMember) => {
      if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      }
      else {
        console.log(`Registering new mobileMember ${req.body.username}`)

        mobileMember.usertype = 'mobile';
        if (req.body.firstname)
          mobileMember.firstname = req.body.firstname;
        if (req.body.lastname)
          mobileMember.lastname = req.body.lastname;
        if (req.body.phoneNum)
          mobileMember.phoneNum = req.body.phoneNum;
        if (req.body.mobileNum)
          mobileMember.mobileNum = req.body.mobileNum;

        if (req.body.hashKey) {
          mobileMember.hashKey = req.body.hashKey;

          Patients.find({'hashKey': req.body.hashKey})
          .then((patient) => {
            if (!patient) {
              err = new Error('Hash Key ' + hashKey + ' is not found/nPlease consult with your doctor');
              err.status = 400;
              return next(err);
            }
            console.log('Patient ' + patient._id + ' is found with patient ' + req.body.hashKey);
            mobileMember.patient = patient._id;
            mobileMember.save((err, mobileMember) => {
              console.log('Save mobileMember');
              if (err) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
                return;
              }
              console.log(`mobileMember._id: ${mobileMember._id}`)
              passport.authenticate('mobileLocal')(req, res, () => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: true, status: 'Registration Successful!'});
              });
            });
          }, (err) => next(err));
        } else {
          mobileMember.save((err, mobileMember) => {
            console.log('Save mobileMember');
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
              return;
            }
            console.log(`mobileMember._id: ${mobileMember._id}`)
            passport.authenticate('mobileLocal')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({success: true, status: 'Registration Successful!'});
            });
          });
        }
      }
    }, (err) => next(err));
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {
  console.log('POST /login ing...');
  passport.authenticate('mobileLocal', {session: false}, (err, mobileMember, info) => {

    if (err) return next(err);

    if (!mobileMember) {
      //console.log('!mobileMember 401 /members/login');
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.login(mobileMember, {session: false}, (err) => {
      //console.log('login err: ', err)
      if (err) {
        console.log('logIn mobileMember 401 mobile/mobileMembers/login');
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.json({success: false, status: 'Login Unsuccessful!', err: info});
      }
      //console.log(`req.user: ${req.user}`);
      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      //console.log('finished');
      res.json({success: true, status: 'Login Successful!', token: token});
    });
  }) (req, res, next);
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/checkJWTToken', cors.corsWithOptions, (req, res, next) => {
  console.log('GET /mobile/auth/checkJWTToken');
  console.log('...ing');
  passport.authenticate('mobilejwt', {session: false}, (err, mobileMember, info) => {
    //console.log('passport.authenticate');
    //console.log('GET /checkJWTToken mobileMember:', mobileMember);
    if (err) return next(err);

    if (!mobileMember) {
      console.log('JWTToken is NOT verified');
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    } else {
      console.log('JWTToken is verified');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, mobileMember: mobileMember});
    }
  })(req, res, next);
});

module.exports = router;
