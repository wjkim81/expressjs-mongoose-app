'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var MemberSchema = new Schema({
  //id: String,
  //username: String
  //passwordd: String

  /**
   * Members for Web
   */
  usertype: {
    type: String,
    default: 'web'
  },
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
  department: {
    type: String,
    default: ''
  },
  mobileNum: {
    //required: true,
    type: String,
    default: ''
  },
  email: {
    //required: true,
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

MemberSchema.plugin(passportLocalMongoose);

var Members = mongoose.model('Member', MemberSchema);

module.exports = Members;
