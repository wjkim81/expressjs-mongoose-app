var express = require('express');
var authRouter = require('./authRouter');
var memberRouter = require('./memberRouter');
//var membersRouter = require('./membersRouter');

var router = express.Router();

router.use('/auth', authRouter);
router.use('/member', memberRouter);
//router.use('/members', membersRouter);

module.exports = router;