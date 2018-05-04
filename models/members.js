'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Member = new Schema({
  //id: String,
  //username: String
  //passwd: String
  admin: {
    type: Boolean,
    default: false
  },
  firstname: {
    type: String,
      default: ''
  },
  lastname: {
    type: String,
    default: ''
  },
  organization: {
    //required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  //type: String, //`types` varchar(100) DEFAULT NULL,
  subject: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  postCode: {
    type: String,
    default: '',
  },
  managerName: {
    //required: true,
    type: String,
    default: ''
  },
  phoneNum: {
    //required: true,
    type: String,
    default: ''
  },
  mobileNum: {
    //required: true,
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

Member.plugin(passportLocalMongoose, {
  selectFields: 'firstname lastname organization'
});

var Members = mongoose.model('Member', Member);

module.exports = Members;
