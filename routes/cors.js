const express = require('express');
const cors = require('cors');
//const app = express();

//const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://localhost:4200']
const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://localhost:4200', 'http://app.vntc.me:3000', 'https://app.vntc.me:3443', 'http://app.vntc.me:4200', 'http://52.78.189.219:3000', 'https://52.78.189.219:3443', 'http://52.78.189.219:4200']
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
