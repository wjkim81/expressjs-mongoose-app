var express = require('express');
var router = express.Router();

var cors = require('../middlewares/cors');
var webRouter = require('./web')
var path = require('path');

router.use('/', webRouter);

/* GET page of angular distribution */
router.route('*')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = router;