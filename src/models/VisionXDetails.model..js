const mongoose = require("mongoose");

const cameraDetails = new mongoose.Schema({
  cameraNumber: {
    type: Number,
    required: false,
  },
  ip: {
    type: String,
    required: true,
  },
  cameraPosition: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: false,
  },
  Coverage: {
    type: String,
    required: false,
  },
  crearedAt: {
    type: Date,
    default: Date.now,
  },
});

const cameraSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  },
  visionXId: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  numberOfCameras: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: false,
  },
  cameraStatuses: [cameraDetails],
});

const CameraModel = mongoose.model("Camera_Status", cameraSchema);
module.exports = CameraModel;
