const mongoose = require("mongoose");
const { logger } = require("../logger/logger");
const WebSocket = require("ws");
const visioXDetails = require("../models/VisionXDetails.model.");
const PersonalInfo = require("../models/PersonalInfo.model");
require("dotenv").config();

const connectDB = async (wss) => {
  const mongoURI = process.env.MONGODB_URI;
  console.log(mongoURI, "checking.....");
  try {
    await mongoose.connect(mongoURI, {
      autoCreate: true,
      autoIndex: false,
    });
    logger.info("MongoDB connected successfully");

    const changeStream = visioXDetails.watch();
    changeStream.on("change", (change) => {
      // Emit the change to all connected WebSocket clients
      if (
        change.operationType === "insert" ||
        change.operationType === "update" ||
        change.operationType === "delete"
      ) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                message: "Data updated",
                change: change,
              })
            );
          }
        });
      }
    });

    const personalStream = PersonalInfo.watch();
    personalStream.on("change", (change) => {
      // Emit the change to all connected WebSocket clients
      if (
        change.operationType === "insert" ||
        change.operationType === "update" ||
        change.operationType === "delete"
      ) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                message: "Data updated",
                change: change,
              })
            );
          }
        });
      }
    });
  } catch (err) {
    logger.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;
