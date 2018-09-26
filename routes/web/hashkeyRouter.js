const express = require('express');
const bodyParser = require('body-parser');

var crypto = require('crypto');


//const mongoose = require('mongoose');
const authenticate = require('../../middlewares/authenticate');
const cors = require('../cors');

const Patients = require('../../models/patients');
const hashkeyRouter = express.Router();

hashkeyRouter.use(bodyParser.json());

hashkeyRouter.route('/getHashKey')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)} )
.get(cors.cors, authenticate.verifyMember,
(req, res, next) => {

  var hashKey = crypto.randomBytes(5).toString('hex');

  Patients.findOne({hashKey: hashKey})
  .then((patient) => {
    if (patient) {
      err = new Error('Hash Key ' + hashKey + ' is already used\n Please try getHashKey API again');
      err.status = 400;
      return next(err);
    } else {
      var message = {hashKey: hashKey};
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json(message);
    }
  });
})
.post(cors.corsWithOptions, authenticate.verifyMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /getHashKey');
})
.put(cors.corsWithOptions, authenticate.verifyMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /getHashKey');
})
.delete(cors.corsWithOptions, authenticate.verifyMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /getHashKey');
});

module.exports = hashkeyRouter;