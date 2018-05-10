const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');
const cors = require('./cors');

const Organizations = require('../models/organizations');
const Members = require('../models/members');

const orgRouter = express.Router();

orgRouter.use(bodyParser.json());

orgRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors, authenticate.verifyMember, authenticate.verifyAdmin,
(req,res,next) => {
  Organizations.find(req.query)
  //.populate('Organizations')
  //.populate('members')
  .then((orgs) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(orgs);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
  (req, res, next) => {
  //console.log(`req.user.admin: ${req.user.admin}`);
  console.log('POST /organizations start');
  Organizations.create(req.body)
  .then((org) => {
    console.log('Organization Created ', org);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(org);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
  (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /orgnizations');
})
.delete(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
  (req, res, next) => {
  //console.log(req.user.admin);
  Organizations.remove({})
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));    
});

orgRouter.route('/:orgId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors,  authenticate.verifyMember, authenticate.verifyAdmin,
(req,res,next) => {
  Organizations.findById(req.params.orgId)
  .then((org) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(org);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /organizations/'+ req.params.orgId);
})
.put(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
(req, res, next) => {
  Organizations.findByIdAndUpdate(req.params.orgId, {
    $set: req.body
  }, { new: true })
  .then((org) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(org);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
(req, res, next) => {
  Organizations.findByIdAndRemove(req.params.orgId)
  .then((org) => {

    if (!org) {
      err = new Error('Organization ' + req.params.orgId + ' is not found');
      err.status = 404;
      return next(err);
    }

    /**
     * Do we have to delete all patietns?
     * Currently, patients will not be deleted even though organization is removed
     * But, members should be deleted
     */
    Members.deleteMany({_id: { $in: org.members } }, (err) => {
      if (err) {
        err = new Error('Some member in ' + org.members + ' are not deleted');
        err.status = 404;
        return next(err);
      }
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(org);

  }, (err) => next(err))
  .catch((err) => next(err));
});

orgRouter.route('/:orgId/patients')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors,  authenticate.verifyMember, authenticate.verifyAdmin,
(req,res,next) => {
  Organizations.findById(req.params.orgId)
  .populate('patients')
  .then((org) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(org.patients);
  }, (err) => next(err))
  .catch((err) => next(err));
})

module.exports = orgRouter;