var express = require('express');
//var authRouter = require('./authRouter');
var adminRouter = require('./adminRouter');
var orgRouter = require('./orgRouter');
var membersRouter = require('./membersRouter');
var patientRouter = require('./patientRouter');
var uploadsRouter = require('./uploadRouter');

var router = express.Router();

//router.use('/auth', authRouter);
router.use('/admins', adminRouter);
router.use('/organizations', orgRouter);
router.use('/members', membersRouter);
router.use('/patients', patientRouter);

module.exports = router;