const mongoose = require("mongoose");
const moment = require("moment-timezone"); // Import moment-timezone

// Function to format the time in a specific timezone (12-hour format with date)
function format12HourTimeWithDateAndTimezone(date, timezone = "Asia/Kolkata") {
  return moment(date).tz(timezone).format("dddd, MMMM D, YYYY hh:mm:ss A");
}

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

// Create and export the camera model
const CameraModel = mongoose.model("Camera_Status", cameraSchema);
module.exports = CameraModel;
