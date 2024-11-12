const mongoose = require("mongoose");

// Helper function to format Date object to railway time (HH:mm:ss)
function formatRailwayTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
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
        default: function () {
          return formatRailwayTime(new Date()); // Store the current time in railway format
        },
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

const CameraModel = mongoose.model("Camera_Status", cameraSchema);
module.exports = CameraModel;
