const express = require('express');
const cors = require('cors');
//const app = express();

//const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://localhost:4200']
const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://localhost:4200', 'http://client.vntc.me:3000', 'https://client.vntc.me:3443', 'http://client.vntc.me:4200', 'http://s3.amazonaws.com', 'https://s3.ap-northeast-2.amazonaws.com'];
var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  console.log('Origin: ', req.header('Origin'));
  if(whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  }
  else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
