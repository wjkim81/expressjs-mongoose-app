var express = require('express');
const bodyParser = require('body-parser');
var Members = require('../models/members');
var Organizations = require('../models/organizations');

var passport = require('passport');
var authenticate = require('../middlewares/authenticate');
var cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });
router.get('/', cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
(req, res, next) => {
  console.log('GET / req.user: ', req.user);
  Members.find({})
  .populate('organization')
  .then((members) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(members);
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/signup', cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
(req, res, next) => {
  //console.log(req.body);
  //console.log(typeof(req.body));
  //console.log(req.body.username);
  /**
   * Wonjin Kim
   * 
   * Here we should check if atomicity or trancscation is complete.
   * When one of operatios in Members or Organizations generates an error,
   * we need to rollback whole process of registering.
   * However, this is skipped now
   * 2018.04.26
   */

  /**
   * To make sure organization id is correctly collected,
   * we will give organization id and name to client,
   * thus client can only choose one of organizations we provided.
   * 
   * req.body.organization: organization._id
   */
  Organizations.findById(req.body.organization)
  .then((org) => {
    // To be modified
    // check if org is not null
    console.log(`org: ${org}`);
    if (!org) {
      err = new Error('Organization ' + req.body.organization + ' is not found!');
      err.status = 404;
      return next(err);
    }
    Members.register(new Members({username: req.body.username}), 
    req.body.password, (err, member) => {
      if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      }
      else {
        console.log(`Registering new member ${req.body.username}`)

        if (req.body.firstname)
          member.firstname = req.body.firstname;
        if (req.body.lastname)
          member.lastname = req.body.lastname;
        if (req.body.organization)
          member.organization = req.body.organization;
        if (req.body.subject)
          member.subject = req.body.subject;
        if (req.body.country)
          member.country = req.body.country;
        if (req.body.city)
          member.city = req.body.city;
        if (req.body.address)
          member.address = req.body.address;
        if (req.body.postCode)
          member.postCode = req.body.postCode;
        if (req.body.managerName)
          member.managerName = req.body.managerName;
        if (req.body.phoneNum)
          member.phoneNum = req.body.phoneNum;
        if (req.body.mobileNum)
          member.mobileNum = req.body.mobileNum;
        
        member.save((err, member) => {
          console.log('Save member');
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
            return ;
          }
          console.log(`member._id: ${member._id}`)
          console.log(`org.members: ${org.members}`)
          org.members.push(member._id);
          //Organizations.findByIdAndUpdate(org._id, {members: org.members}, {new: true}, (err, org)
          org.save((err, org) => {
            console.log('Save organization');
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
              return;
            }
            passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({success: true, status: 'Registration Successful!'});
            });
          });
        });
      }
    }, (err) => next(err));
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {
  console.log('POST /login ing...');
  passport.authenticate('local', {session: false}, (err, member, info) => {
    //console.log(err);
    //console.log(`member._id: ${member._id}`)
    if (err) return next(err);

    if (!member) {
      //console.log('!member 401 /members/login');
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.login(member, {session: false}, (err) => {
      //console.log('login err: ', err)
      if (err) {
        console.log('logIn member 401 /members/login');
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!', err: info});
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
  console.log('GET /checkJWTToken');
  console.log('...ing');
  passport.authenticate('jwt', {session: false}, (err, member, info) => {
    console.log('passport.authenticate');
    console.log('GET /checkJWTToken member:', member);
    if (err) return next(err);

    if (!member) {
      console.log('JWTToken is NOT verified');
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    } else {
      console.log('JWTToken is verified');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, member: member});
    }
  })(req, res, next);
});



/* GET member information with memberId. */
router.get('/member/:memberId', cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  console.log('GET /:memberId req.user: ', req.user);
  Members.findById(req.params.memberId)
  .populate('organization')
  .then((member) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(member);
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.delete('/remove/:memberId', cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
(req, res, next) => {
  Members.findByIdAndRemove(req.params.memberId)
  .then((member) => {
    if (!member) {
      err = new Error('Member ' + member._id + ' is not found!');
      err.status = 404;
      return next(err);
    }
    Organizations.findById(member.organization)
    .then((org) => {
      console.log(`org: ${org}`);
      if (!org) {
        err = new Error('Organization ' + member.organization + ' is not found!');
        err.status = 404;
        return next(err);
      }

      /** 
       * Find the index of member in organizations.members
       * and remove member in corresponding organization.
       */
      let index = org.members.indexOf(member._id);
      if (index >= 0) {
        org.members.splice(index, 1);
        org.save()
        .then((org) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json(member);
        }, (err) => next(err));
      } else {
        err = new Error('Member ' + member._id + ' is not found in organization ' + org._id);
        err.status = 404;
        return next(err);
      }
    }, (err) => next(err));
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = router;
