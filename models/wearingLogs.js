'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const Member = require('./members');

var wearingLogSchema = new Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  }
}/*, {
  timestamps: true
}*/);

var wearingLogsSchema = mongoose.Schema({
  mobileMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MobileMember'
  },
  logs: [wearingLogSchema],
}/* {
  timestamps: true
}*/);

var WearingLogs = mongoose.model('WearingLogs', wearingLogsSchema);

module.exports = WearingLogs;