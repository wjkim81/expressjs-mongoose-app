const express = require('express');
const bodyParser = require('body-parser');

// var crypto = require('crypto');
//const mongoose = require('mongoose');
const authenticate = require('../../middlewares/authenticate');
const cors = require('../cors');

const Patients = require('../../models/patients');
const Organizations = require('../../models/organizations');

const patientRouter = express.Router();

patientRouter.use(bodyParser.json());

patientRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors, authenticate.verifyMember,
(req, res, next) => {
  console.log('req.query: ', req.query);
  console.log('req.user: ', req.user);
  var query = {};
  if (req.user.organization)
    query.organization = req.user.organization;
  if (Object.keys(req.query).length !== 0)
    query.updatedAt = {"$gte": req.query.startDate, "$lte": req.query.endDate};

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
.post(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {

  // console.log('Before updating req.body: ', req.body);
  //var patient = req.body;
  req.body.organization = req.user.organization;
  if (req.body.bodyMeasurements) req.body.bodyMeasurements[0].updatedBy = req.user._id;
  if (req.body.spineInfos) req.body.spineInfos[0].updatedBy = req.user._id;
  if (req.body.xRayFiles) req.body.xRayFiles[0].updatedBy = req.user._id;
  if (req.body.comments) req.body.comments[0].updatedBy = req.user._id;
  // if (req.body.threeDFiles) req.body.threeDFiles[0].updatedBy = req.user._id;

  //updating 10 digits hash key
  // var hashKey = crypto.randomBytes(5).toString('hex');

  Patients.findOne({hashKey: req.body.hashKey})
  .then((patient) => {
    if (patient) {
      err = new Error('Hash Key ' + hashKey + ' is already used\n Please register Patient again');
      err.status = 400;
      return next(err);
    } else {
      // console.log('After updating req.body: ', req.body);
      /**
       * req.body.organization: organization._id
       */
      Organizations.findById(req.body.organization)
      .then((org) => {
        console.log(`org: ${org}`);
        if (!org) {
          err = new Error('Organization ' + req.body.organization + ' is not found!');
          err.status = 404;
          return next(err);
        }
        /*
        var patient = new Patients();
        patient.firstname = req.body.firstname;
        patient.lastname = req.body.lastname;
        patient.birthday = req.body.birthday;
        patient.sex = req.body.sex;
        patient.organization = req.body.organization;

        if (req.body.bodyMeasurements) patient.bodyMeasurements.push(req.body.bodyMeasurements[0]);
        if (req.body.spineInfos) patient.spineInfos.push(req.body.spineInfos[0]);
        if (req.body.xRayFiles) patient.xRayFiles.push(req.body.xRayFiles[0]);
        if (req.body.threeDFiles) patient.threeDFiles.push(req.body.threeDFiles[0]);
        */
        return Patients.create(req.body)
        //.populate('orgId')
        //patient.save()
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
    }
  });
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
(req, res, next) => {
  Patients.findById(req.params.patientId)
  .populate('organization')
  .populate('spineInfos.updatedBy')
  .populate('bodyMeasurements.updatedBy')
  .populate('xRayFiles.updatedBy')
  .populate('threeDFiles.updatedBy')
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

patientRouter.route('/:patientId/spineInfos')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors, authenticate.verifyMember,
(req, res, next) => {
  Patients.findById(req.params.patientId)
  .then((patient) => {
    if (patient.organization != req.user.organization) {
      var err = new Error('Member ' + req.user._id + ' cannot request GET on patient ' + req.params.patientId);
      res.statusCode = 403;
      return next(err);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(patient.spineInfos);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  console.log('POST spineInfos  ' + req.params.patientId);

  Patients.findById(req.params.patientId)
  .then((patient) => {

    console.log(`${patient.organization} : ${req.user.organization._id}`);
    if (!patient.organization.equals(req.user.organization)) {
      var err = new Error('Member ' + req.user._id + ' cannot request GET on patient ' + req.params.patientId);
      err.status = 403;
      return next(err);
    }
    
    if (!patient) {
      var err = new Error('Patient ' + req.params.patientId + ' is not found');
      err.status = 404;
      return next(err);
    }
    req.body.updatedBy = req.user._id;
    patient.spineInfos.push(req.body);

    patient.save()
    .then((patient) => {
      
      patient
      .populate('organization')
      .populate('spineInfos.updatedBy')
      .populate('bodyMeasurements.updatedBy')
      .populate('xRayFiles.updatedBy')
      .populate('threeDFiles.updatedBy', (err) => {
        if (err) {
          next(err);
        } else {
          console.log('patient: ', patient);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json(patient);
        }
      });
    }, (err) => next(err));
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /patients/'+ req.params.patientId + '/spineInfos');
})
.delete(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /patients/'+ req.params.patientId + '/spineInfos');
});

patientRouter.route('/:patientId/bodyMeasurements')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors, authenticate.verifyMember,
(req, res, next) => {
  Patients.findById(req.params.patientId)
  .then((patient) => {
    if (patient.organization != req.user.organization) {
      var err = new Error('Member ' + req.user._id + ' cannot request GET on patient ' + req.params.patientId);
      res.statusCode = 403;
      return next(err);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(patient.bodyMeasurements);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  console.log('POST bodyMeasurements  ' + req.params.patientId);

  Patients.findById(req.params.patientId)
  .then((patient) => {

    console.log(`${patient.organization} : ${req.user.organization._id}`);
    if (!patient.organization.equals(req.user.organization)) {
      var err = new Error('Member ' + req.user._id + ' cannot request GET on patient ' + req.params.patientId);
      err.status = 403;
      return next(err);
    }
    
    if (!patient) {
      var err = new Error('Patient ' + req.params.patientId + ' is not found');
      err.status = 404;
      return next(err);
    }
    req.body.updatedBy = req.user._id;
    patient.bodyMeasurements.push(req.body);

    patient.save()
    .then((patient) => {
      
      patient
      .populate('organization')
      .populate('spineInfos.updatedBy')
      .populate('bodyMeasurements.updatedBy')
      .populate('xRayFiles.updatedBy')
      .populate('threeDFiles.updatedBy', (err) => {
        if (err) {
          next(err);
        } else {
          console.log('patient: ', patient);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json(patient);
        }
      });
    }, (err) => next(err));
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /patients/'+ req.params.patientId + '/bodyMeasurements');
})
.delete(cors.corsWithOptions, authenticate.verifyMember, //authenticate.verifyAdmin,
(req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /patients/'+ req.params.patientId + '/bodyMeasurements');
});

module.exports = patientRouter;