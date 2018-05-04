var Members = require('../models/members');
var Organizations = require('../models/organizations');

var config = require('../config');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connection URL
var url = config.mongoUrl;
var connect = mongoose.connect(url);

console.log("Connected correctly to server");

var organization_id = '5ae1f9943b28dd2af95a4e';

Organizations.findById(organization_id, (err, org) => {
  console.log(`org: ${org}`);
  if (!org) {
    console.log('Organization ' + organization_id + ' is not found!');
  }
});
