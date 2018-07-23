var express = require('express');
const bodyParser = require('body-parser');
var MobileMembers = require('../../models/mobileMembers');

var passport = require('passport');
var authenticate = require('../../middlewares/authenticate');
var cors = require('../cors');

var router = express.Router();
router.use(bodyParser.json());

router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });
router.get('/', cors.corsWithOptions, authenticate.verifyMobileMember,
(req, res, next) => {
  console.log('GET / req.user: ', req.user);
  MobileMembers.find({})
  .then((mobileMembers) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(mobileMembers);
  }, (err) => next(err))
  .catch((err) => next(err));
});

/**
 *  GET mobileMember information with memberId
 */
router.get('/members/:memberId', cors.corsWithOptions,
(req, res, next) => {
  console.log('GET /:memberId req.user: ', req.user);
  Members.findById(req.params.memberId)
  .then((mobileMember) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(mobileMember);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete('/members/:memberId', cors.corsWithOptions,
(req, res, next) => {
  Members.findByIdAndRemove(req.params.memberId)
  .then((mobileMember) => {
    if (!mobileMember) {
      err = new Error('MobileMember ' + mobileMember._id + ' is not found!');
      err.status = 404;
      return next(err);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json(mobileMember);
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = router;