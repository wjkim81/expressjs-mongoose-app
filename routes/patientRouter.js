const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');
const cors = require('./cors');

const Patients = require('../models/patients');
const Organizations = require('../models/organizations');

const patientRouter = express.Router();

patientRouter.use(bodyParser.json());

patientRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors, authenticate.verifyMember, (req,res,next) => {
  Patients.find(req.query)
  .then((patients) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(patients);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMember, authenticate.verifyAdmin,
(req, res, next) => {
  /**
   * req.body.organizationId: organization._id
   */
  Organizations.findById(req.body.organization)
  .then((org) => {
    console.log(`org: ${org}`);
    if (!org) {
      err = new Error('Organization ' + req.body.organization + ' is not found!');
      err.status = 404;
      return next(err);
    }

    Patients.create(req.body)
    //.populate('orgId')
    .then((patient) => {
      console.log('Patients Created ', patient);
      org.patients.push(patient._id);
      org.save((err, org) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json(patient);        
      }, (err) => next(err));
    }, (err) => next(err));
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /patients');
})
.delete(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin, 
(req, res, next) => {
  Patients.remove({})
  .then((patient) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(patient);
  }, (err) => next(err))
  .catch((err) => next(err));    
});

patientRouter.route('/:patientId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors, authenticate.verifyMember,
(req,res,next) => {
  Patients.findById(req.params.patientId)
  .then((patient) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(patient);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /patients/'+ req.params.patientId);
})
.put(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  Patients.findByIdAndUpdate(req.params.patientId, {
    $set: req.body
  }, { new: true })
  .then((patient) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(patient);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  Patients.findByIdAndRemove(req.params.patientId)
  .then((patient) => {
    // To be modified
    // Delete patient in organization
    if (!patient) {
      err = new Error('Patient ' + req.params.patientId + ' is not found');
      err.status = 404;
      return next(err);
    }
    Organizations.findById(patient.organization)
    .then((org) => {
      console.log(`org: ${org}`);
      if (!org) {
        err = new Error('Organization ' + patient.organization + ' is not found!');
        err.status = 404;
        return next(err);
      }

      let index = org.patients.indexOf(patient._id);
      console.log('index ' + index + ' will removed in organization.patients[]');
      if (index >= 0) {
        org.patients.splice(index, 1);
        org.save()
        .then((org) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json(patient);
        }, (err) => next(err));
      } else {
        err = new Error('Patient ' + req.params.patientId + ' is not found in oragnization ' + org._id);
        err.status = 404;
        return next(err);
      }
    }, (err) => next(err));
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = patientRouter;