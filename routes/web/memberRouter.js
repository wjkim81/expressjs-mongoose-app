var express = require('express');
const bodyParser = require('body-parser');
var Members = require('../../models/members');
var Patients = require('../../models/patients');
var WearingLogs = require('../../models/wearingLogs');

//var passport = require('passport');
var authenticate = require('../../middlewares/authenticate');
var cors = require('../../middlewares/cors');

var memberRouter = express.Router();
memberRouter.use(bodyParser.json());

memberRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyMember,
(req, res, next) => {
  console.log('GET / req.user: ', req.user);
  Members.findById(req.user._id)
  .populate('organization')
  .then((member) =>{
    // console.log(member);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(member);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyMember, 
(req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /member');
})
.put(cors.corsWithOptions, authenticate.verifyMember,
(req, res, next) => {
  Members.findByIdAndUpdate(req.user._id ,{
    $set: req.body
  }, { new: true })
  .then((member) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(member);
  }, (err) = next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyMember,
(req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /member'+ req.user._id);
});

module.exports = memberRouter;