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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  history: [
    {
      updatedTimes: {
        type: String,
      },
    },
  ],
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
    kitStatus: {
      type: String,
      enum: ["working", "not working"],
      default: "working", // Default to 'working' initially
    },
    kithistory: [
      {
        kitUpdatedTimes: {
          type: String,
        },
      },
    ],
    cameraStatuses: [cameraDetails],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Create and export the camera model
const CameraModel = mongoose.model("Camera_Status", cameraSchema);
module.exports = CameraModel;
