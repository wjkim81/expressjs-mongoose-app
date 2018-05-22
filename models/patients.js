'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Member = require('./members');

var bodyMeasurementSchema = new Schema({
  updatedBy: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  height: {
    required: true,
    type: Number
  },
  weight: {
    required: true,
    type: Number
  },
  shoulder: {
    required: true,
    type: Number
  },
  bust: {
    required: true,
    type: Number
  },
  waist: {
    reqiuired: true,
    type: Number
  },
  hip: {
    required: true,
    type: Number
  },
  /*
  lumber: {
    required: true,
    type: Number
  },
  lumberHeight: {
    required: true,
    type: Number
  }
  */
}, {
  timestamps: true
});

var spineInfoSchema = new Schema({
  updatedBy: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  type: {
    required: true,
    type: String,
  },
  risser: {
    required: true,
    type: Number
  },
  /*
  stage: {
    required: true,
    type: String
  },
  */
  apexStart1: {
    required: true,
    type: String
  },
  cobbAng1: {
    required: true,
    type: Number
  },
  apexEnd1: {
    required: true,
    type: String
  },
  direction1: {
    required: true,
    type: String
  },
  apexStart2: {
    type: String
  },
  cobbAng2: {
    type: Number
  },
  apexEnd2: {
    type: String
  },
  direction2: {
    type: String
  },
  apexStart3: {
    type: String
  },
  cobbAng3: {
    type: Number
  },
  apexEnd3: {
    type: String
  },
  direction3: {
    type: String
  }
}, {
  timestamps: true
});

var xRaySchema = new Schema({
  updatedBy: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  filePath: {
    required: true,
    type: String
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

var threeDSchema = new Schema({
  updatedBy: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  filePath: {
    required: true,
    type: String
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

var patientSchema = mongoose.Schema({
  /*
  updatedBy: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  */
  firstname: {
    required: true,
    type: String,
    default: ''
  },
  lastname: {
    required: true,
    type: String,
    default: ''
  },
  birthday: {
    required: true,
    type: Date
  },
  sex: {
    required: true,
    type: String,
    default: ''
  },
  /**
   * organizationId refers id of organization.
   * Patient should be treated by one organization.
   */
  organization: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  /**
   * patientId: Patient's own id used in organization
   * This id is not relevant to id used in vntc system.
   */
  patientId: {
    type: Number,
    default: ''
  },
  bodyMeasurements: [bodyMeasurementSchema],
  spineInfos: [spineInfoSchema],
  xRayFiles: [xRaySchema],
  threeDFiles: [threeDSchema],
  visitedDays: [Date]
}, {
  timestamps: true
});

/*
patientSchema.post('save', (doc, next) => {
  doc
  .populate('bodyMeasurements')
  .populate('spineInfos')
  .populate('xRayFiles')
  .populate('threeDFiles')
  .populate('visitedDays')
  .execPopulate(() => {
    console.log(doc);
    next();
  });
});
*/
var Patients = mongoose.model('Patient', patientSchema);

module.exports = Patients;