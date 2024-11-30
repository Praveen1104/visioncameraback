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
  camera_ip: {
    type: String,
    required: false,
  },
  cameraPosition: {
    type: String,
    required: true,
  },
  Coverage: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: false,
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
const historymodel = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    visionXId: {
      type: String,
      required: true,
    },
    kitStatus: {
      type: String,
      enum: ["working", "not working"],
      default: "working", // Default to 'working' initially
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
const historyModel = mongoose.model("history_Status", historymodel);
module.exports = historyModel;
