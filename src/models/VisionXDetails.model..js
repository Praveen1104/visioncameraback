const mongoose = require("mongoose");
const moment = require("moment-timezone"); // Import moment-timezone

// Camera details schema
const cameraDetails = new mongoose.Schema({
  cameraNumber: {
    type: Number,
    required: false,
  },
  ip: {
    type: String,
    required: true,
  },
  camera_ip: {
    type: String,
    required: false,
  },
  cameraPosition: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  Coverage: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Main camera schema
const cameraSchema = new mongoose.Schema(
  {
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
      required: false,
    },
    longitude: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    numberOfCameras: {
      type: Number,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
    },

    cameraStatuses: [cameraDetails],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Create and export the camera model
const CameraModel = mongoose.model("Camera_Status", cameraSchema);
module.exports = CameraModel;
