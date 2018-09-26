var express = require('express');
const bodyParser = require('body-parser');
var Members = require('../../models/members');
var Organizations = require('../../models/organizations');

var passport = require('passport');
var authenticate = require('../../middlewares/authenticate');
var cors = require('../cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET all members listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });
router.get('/', cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
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

/* GET member information with memberId. */
router.get('/:memberId', cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
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

router.delete('/:memberId', cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
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
