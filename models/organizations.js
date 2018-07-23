const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var organizationSchema = new Schema({
  name: {
    required: true,
    unique: true,
    type: String
  },
  country: {
    required: true,
    type: String
  },
  type: {
    required: true,
    type: String
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
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }]
}, {
  timestamps: true
});

var Organizations = mongoose.model('Organization', organizationSchema);

module.exports = Organizations;