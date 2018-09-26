'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const Member = require('./members');

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
    required: true,
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
  curveStart1: {
    required: true,
    type: String
  },
  cobbAng1: {
    required: true,
    type: Number
  },
  curveEnd1: {
    required: true,
    type: String
  },
  direction1: {
    required: true,
    type: String
  },
  major1: {
    required: true,
    type: Boolean
  },
  curveStart2: {
    type: String
  },
  cobbAng2: {
    type: Number
  },
  curveEnd2: {
    type: String
  },
  direction2: {
    type: String
  },
  major2: {
    required: true,
    type: Boolean
  },
  curveStart3: {
    type: String
  },
  cobbAng3: {
    type: Number
  },
  curveEnd3: {
    type: String
  },
  direction3: {
    type: String
  },
  major3: {
    required: true,
    type: Boolean
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

var commentSchema = new Schema({
  updatedBy: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  comment: {
    required: true,
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
    //required: true,
    type: String,
    default: ''
  },
  lastname: {
    //required: true,
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
   * hashKey is unique id web which is used for identification of the patient in mobile application.
   * If this is not set, mobile cannot find information of the patient.
   */
  hashKey: {
    type: String,
    required: true,
    unique: true
    //default: ''
  },
  /*
  ordering: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ordering'
  },
  */
  bodyMeasurements: [bodyMeasurementSchema],
  spineInfos: [spineInfoSchema],
  xRayFiles: [xRaySchema],
  thrcommenteeDFiles: [commentSchema],
  visitedDays: [Date],
  nextVisitDay: Date
}, {
  timestamps: true
});

var Patients = mongoose.model('Patient', patientSchema);

module.exports = Patients;