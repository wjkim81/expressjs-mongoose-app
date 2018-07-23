var express = require('express');
var router = express.Router();
var cors = require('./cors');
var path = require('path');

/* GET home page. */
router.route('*')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = router;