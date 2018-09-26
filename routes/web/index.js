var express = require('express');
var authRouter = require('./authRouter');
var adminRouter = require('./adminRouter');
var orgRouter = require('./orgRouter');
var memberRouter = require('./memberRouter');
var membersRouter = require('./membersRouter');
var patientRouter = require('./patientRouter');
var hashkeyRouter = require('./hashkeyRouter');
var uploadsRouter = require('./uploadRouter');

var router = express.Router();

router.use('/auth', authRouter);
router.use('/admins', adminRouter);
router.use('/organizations', orgRouter);
router.use('/member', memberRouter);
router.use('/members', membersRouter);
router.use('/patients', patientRouter);
router.use('/hashkey', hashkeyRouter);
router.use('/uploads', uploadsRouter);

module.exports = router;