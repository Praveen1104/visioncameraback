const mongoose = require("mongoose");

const personalInfoSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: false,
  },
  pincode: {
    type: Number,
    required: true,
  },
  addressImage: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: false,
  },
  contentLogo: {
    type: String,
    required: false,
  },
  contentImage: {
    type: String,
    required: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PersonalInfo = mongoose.model("Personal_Information", personalInfoSchema);

module.exports = PersonalInfo;
