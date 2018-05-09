const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');
const cors = require('./cors');

const Organizations = require('../models/organizations');
const Members = require('../models/members');
const Patients = require('../models/patients');

const adminRouter = express.Router();

adminRouter.use(bodyParser.json());

adminRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors, authenticate.verifyMember, authenticate.verifyAdmin,
(req,res,next) => {
  Organizations.find({ "organization": req.user.organization })
  .then((orgs) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(orgs);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /admins');
})
.put(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /admins');
})
.delete(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin, 
(req, res, next) => {
  Patients.remove({})
  .then((patient) => {
    Members.remove({})
    .then((members) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json(patient);
    }, (err) => next(err));
  }, (err) => next(err))
  .catch((err) => next(err));    
});

adminRouter.route('/patients')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors, authenticate.verifyMember, authenticate.verifyAdmin,
(req,res,next) => {
  console.log('req.query: ', req.query);
  console.log('req.user: ', req.user);
  var query = {};
  if (req.query) query.updatedAt = {"$gte": req.query.startDate, "$lte": req.query.endDate};

  console.log('query: ', query);

  //Patients.find({ "organization": req.user.organization })
  Patients.find(query)
  .populate('organization')
  .then((patients) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(patients);
  }, (err) => next(err))
  .catch((err) => next(err));
})

module.exports = adminRouter;