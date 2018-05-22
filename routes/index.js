var express = require('express');
var router = express.Router();
var cors = require('./cors');
var cors2 = require('cors');
var path = require('path');

/* GET home page. */
router.route('*')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
//.get(cors2({origin: 'https://client2.vntc.me:3443'}), (req, res, next) => {
//.get(cors2({origin: 'https://localhost:3443'}), (req, res, next) => {
  //res.render('index', { title: 'Express' });
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = router;