var express = require('express');
const bodyParser = require('body-parser');
var MobileMembers = require('../../models/mobileMembers');
var Patients = require('../../models/patients');

var passport = require('passport');
var authenticate = require('../../middlewares/authenticate');
var cors = require('../cors');

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
    res.json(mobileMember);
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
    res.json(hashKey);
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
      mobileMember.hashKey = undefined;
      mobileMember.save()
      .then((mobileMember) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(mobileMember);
      }, (err) => next(err));
    }
    else {
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
  res.end('Get operation not supported on /mobile/member/' + req.params.hashKey);
})
.post(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  if (req.user.hashKey) {
    res.statusCode = 403;
    res.end('hashKey is already updated');
  } else {
    MobileMembers.findById(req.user._id)
    .then((mobileMember) => {
      if (mobileMember) {
        mobileMember.hashKey = req.params.hashKey;
        mobileMember.save()
        .then((mobileMember) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(mobileMember);
        }, (err) => next(err));
      }
      else {
        err = new Error('mobileMember ' + req.user._id + ' not found');
        err.status = 404;
        return next(err);
      }
    }, (err) => next(err))
    .catch((err) => next(err));
  }
})
.put(cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  if (!req.user.hashKey) {
    res.statusCode = 403;
    res.end('hashKey is not updated yet');
  } else {
    Patients.find({'hashKey': req.params.hashKey})
    .then((patient) => {
      if (!patient) {
        err = new Error('Hash Key ' + hashKey + ' is not found/nPlease consult with your doctor');
        err.status = 400;
        return next(err);
      }
      console.log('Patient ' + patient._id + ' is found with patient ' + req.params.hashKey);

      MobileMembers.findById(req.user._id)
      .then((mobileMember) => {
        if (mobileMember) {
          mobileMember.hashKey = req.params.hashKey;
          mobileMember.patient = patient._id;
          mobileMember.hashKey = req.params.hashKey;
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
  MobileMembers.findById(req.user._id)
  .then((mobileMember) => {
    if (mobileMember) {
      mobileMember.hashKey = undefined;
      mobileMember.save()
      .then((mobileMember) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(mobileMember);                
      }, (err) => next(err));
    }
    else {
      err = new Error('mobileMember ' + req.user._id + ' not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));    
});

module.exports = memberRouter;