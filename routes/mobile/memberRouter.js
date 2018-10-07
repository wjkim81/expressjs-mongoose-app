var express = require('express');
const bodyParser = require('body-parser');
var MobileMembers = require('../../models/mobileMembers');
var Patients = require('../../models/patients');
var WearingLogs = require('../../models/wearingLogs');

//var passport = require('passport');
var authenticate = require('../../middlewares/authenticate');
var cors = require('../../middlewares/cors');

var memberRouter = express.Router();
memberRouter.use(bodyParser.json());

memberRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyMobileMember,
(req, res, next) => {
  console.log('GET / req.user: ', req.user);
  MobileMembers.findById(req.user._id)
  .populate('Patient')
  .then((mobileMember) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(mobileMember);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMobileMember, 
(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /mobile/member');
})
.put(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  MobileMembers.findByIdAndUpdate(req.user._id ,{
    $set: req.body
  }, { new: true })
  .then((mobileMember) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(mobileMember);
  }, (err) = next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /mobile/member'+ req.user._id);
});

memberRouter.route('/hashKey')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyMobileMember,
(req, res, next) => {
  if (req.user.hashKey) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.user.hashKey);
  } else {
    res.statusCode = 204;
    res.end('There is no hash key with patient ' + req.user._id);
  }
})
.post(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /mobile/member/hashkey');
})
.put(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /mobile/member/hashkey');
})
.delete(cors.corsWithOptions,  authenticate.verifyMobileMember,
(req, res, next) => {
  MobileMembers.findById(req.user._id)
  .then((mobileMember) => {
    if (mobileMember) {
      if (mobileMember.hashKey) mobileMember.hashKey = undefined;
      if (mobileMember.patient) mobileMember.patient = undefined;

      console.log('Deleting hashkey ' + mobileMember.hashKey + ' of mobileMember ' + mobileMember._id);
      return mobileMember.save()
      .then((mobileMember) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json(mobileMember);
      }, (err) => next(err));
    } else {
      err = new Error('mobileMember ' + req.user._id + ' not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});

memberRouter.route('/hashKey/:hashKey')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyMobileMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('GET operation not supported on /mobile/member/' + req.params.hashKey);
})
.post(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  if (req.user.hashKey) {
    res.statusCode = 403;
    res.end('hashKey is already created');
  } else {
    Patients.findOne({'hashKey': req.params.hashKey})
    .then((patient) => {
      if (!patient) {
        err = new Error('Hash Key ' + hashKey + ' is not found/nPlease consult with your doctor');
        err.status = 400;
        return next(err);
      }
      console.log('Patient ' + patient._id + ' is found with hashKey ' + req.params.hashKey);

      return MobileMembers.findById(req.user._id)
      .then((mobileMember) => {
        if (mobileMember) {
          mobileMember.hashKey = req.params.hashKey;
          mobileMember.patient = patient._id;
          
          return mobileMember.save((err, mobileMember) => {
            console.log('Save mobileMember');
            if (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.json({err: err});
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(mobileMember);
          });
        }
      }, (err) => next(err))
    }, (err) => next(err))
    .catch((err) => next(err));
  }
})
.put(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  if (!req.user.hashKey) {
    res.statusCode = 403;
    res.end('hashKey is not created yet');
  } else {
    Patients.findOne({'hashKey': req.params.hashKey})
    .then((patient) => {
      console.log('Patient: ' + patient);
      if (!patient) {
        err = new Error('Hash Key ' + req.params.hashKey + ' is not found/nPlease consult with your doctor');
        err.status = 400;
        return next(err);
      }
      console.log('Patient ' + patient._id + ' is found with hashKey ' + req.params.hashKey);

      return MobileMembers.findById(req.user._id)
      .then((mobileMember) => {
        if (mobileMember) {
          mobileMember.hashKey = req.params.hashKey;
          mobileMember.patient = patient._id;
          mobileMember.save((err, mobileMember) => {
            console.log('Save mobileMember');
            if (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.json({err: err});
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(mobileMember);
          });
        }
      }, (err) => next(err))
    }, (err) => next(err))
    .catch((err) => next(err));
  }
})
.delete(cors.corsWithOptions,  authenticate.verifyMobileMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /mobile/member/hashkey/' + req.params.hashKey);
});

memberRouter.route('/wearingLogs/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyMobileMember,
(req, res, next) => {
  console.log('req.user: ' + req.user);
  console.log('req.user.wearingLogs: ' + req.user.wearingLogs);

  WearingLogs.findById(req.user.wearingLogs)
  .then((wearingLogs) => {
    console.log('wearingLogs: ' + req.user.wearingLogs);

    if (!wearingLogs) {
      console.log('wearingLogs are not yet created');
      err = new Error('Wearing logs + ' + req.user.wearingLogs +
                      ' with mobile member ' + req.user._id + ' is not found');
      err.status = 400;
      return next(err);
    }
    console.log('wearingLogs: ' + wearingLogs);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(wearingLogs);
  }, (err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {

  if (req.user.wearingLogs) {
    WearingLogs.findById(req.user.wearingLogs)
    .then((wearingLogs) => {
      console.log('wearingLogs: ' + wearingLogs);

      if (!wearingLogs) {
        console.log('wearingLogs are not yet created');
        err = new Error('Wearing logs + ' + req.user.wearingLogs +
                        ' with mobile member ' + req.user._id + ' is not found');
        err.status = 400;
        return next(err);
      }
      //console.log('wearingLogs: ' + wearingLogs);
      req.body.forEach((log) => {
        wearingLogs.logs.push(log);
      });

      return wearingLogs.save()
      .then((wearingLogs) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json(wearingLogs);
      }, (err) => next(err))
    }, (err) => next(err))
    .catch((err) => next(err));
  } else {
    var wearingLogs = new WearingLogs();
    wearingLogs.mobileMember = req.user._id;

    req.body.forEach((log) => {
      wearingLogs.logs.push(log);
    });


    wearingLogs.save()
    .then((wearingLogs) => {
      console.log('wearingLogs: ' + wearingLogs);
      
      return MobileMembers.findById(req.user._id)
      .then((mobileMember) => {
        mobileMember.wearingLogs = wearingLogs._id;
        return mobileMember.save((err, mobileMember) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.json({err: err});
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json(wearingLogs);
        });
      }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
  }
})
.put(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /mobile/member/wearingLogs');
})
.delete(cors.corsWithOptions,  authenticate.verifyMobileMember,
(req, res, next) => {
  if (req.user.wearingLogs) {
    WearingLogs.findByIdAndRemove(req.user.wearingLogs)
    .then((wearingLogs) => {
      console.log('wearingLogs: ' + wearingLogs);

      //req.user.wearingLogs = undefined;

      console.log('Updating req.user: ' + req.user);

      return MobileMembers.findByIdAndUpdate(req.user._id, {
        $set: { "wearingLogs": undefined }
      }, { new: true })
      .then((mobileMember) => {
        console.log('Updated mobileMember: ' + mobileMember);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json(mobileMember);
      }, (err) => next(err))
    }, (err) => next(err))
    .catch((err) => next(err));
  } else {
    console.log('wearingLogs are not yet created');
    var err = new Error('Wearing logs with mobile member ' + req.user._id + ' is not found');
    err.status = 400;
    return next(err);;
  }
});

memberRouter.route('/patientInfo/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyMobileMember,
(req, res, next) => {
  console.log('GET /mobile/member/patientInfo');
  console.log('req.user: ' + req.user);
  console.log('req.user.patient: ' + req.user.patient);

  var sex = undefined;
  var birthday = undefined;  
  var bodyMeasurement = undefined;
  var spineInfo = undefined;

  if (req.user.patient.sex)
    sex = req.user.patient.sex;
  
  if (req.user.patient.birthday)
    birthday = req.user.patient.birthday;

  if (req.user.patient.bodyMeasurements.length > 0)
    bodyMeasurement = req.user.patient.bodyMeasurements[req.user.patient.bodyMeasurements.length - 1];

  if (req.user.patient.spineInfos.length > 0)
    spineInfo = req.user.patient.spineInfos[req.user.patient.spineInfos.length - 1];

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({sex: sex, birthday: birthday, bodyMeasurement: bodyMeasurement, spineInfo: spineInfo});
/*
  Patients.findById(req.user.patient)
  .then((patient) => {
    console.log('patient: ' + req.user.patient);

    if (!patient) {
      console.log('patient are not yet created');
      err = new Error('patient logs + ' + req.user.patient +
                      ' with mobile member ' + req.user._id + ' is not found');
      err.status = 400;
      return next(err);
    }
    console.log('patient: ' + patient);

    var bodyMeasurement = undefined;
    var spineInfo = undefined;

    if (patient.bodyMeasurement.length > 0)
      bodyMeasurement = patient.bodyMeasurement[patient.bodyMeasurement.length -1];

    if (patient.spineInfos.length > 0)
      spineInfo = patient.spineInfos[patient.spineInfos.length - 1];

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({bodyMeasurement: bodyMeasurement, spineInfo: spineInfo});
  }, (err) => next(err));

  */
})
.post(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /mobile/member/patientInfo');
})
.put(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /mobile/member/patientInfo');
})
.delete(cors.corsWithOptions,  authenticate.verifyMobileMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /mobile/member/patientInfo');
});

memberRouter.route('/allMobileMembers/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
  MobileMembers.find()
  .then((mobileMembers) => {
    if (!mobileMembers) {
      err = new Error('Error fetching all patients');
      err.status = 500;
      return next(err);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(mobileMembers);
  })
});

memberRouter.route('/allPatients/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
  Patients.find()
  .then((patients) => {
    if (!patients) {
      err = new Error('Error fetching all patients');
      err.status = 500;
      return next(err);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(patients);
  })
});

module.exports = memberRouter;