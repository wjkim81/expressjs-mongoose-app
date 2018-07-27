'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var MobileMemberSchema = new Schema({
  //id: String,
  //username: String
  //passwordd: String

  /**
   * Members for mobile application
   */
  usertype: {
    type: String,
    default: 'mobile'
  },
  firstname: {
    type: String,
    default: ''
  },
  lastname: {
    type: String,
    default: ''
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  hashKey: {
    type: String,
    //unique: true
    default: ''
  },
  wearingLogs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WearingLogs'
  }
}, {
  timestamps: true
});

MobileMemberSchema.plugin(passportLocalMongoose);

var MobileMembers = mongoose.model('MobileMember', MobileMemberSchema);

module.exports = MobileMembers;
