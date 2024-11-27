const mongoose = require("mongoose");
const { logger } = require("../logger/logger");
const WebSocket = require("ws");
const visioXDetails = require("../models/VisionXDetails.model.");
const PersonalInfo = require("../models/PersonalInfo.model");
require("dotenv").config();
const moment = require("moment-timezone");
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
// const updateOldCameraDocuments = async () => {
//   try {
//     // Find all VisionX systems where at least one camera system has no kithistory or is empty
//     const visionXSystems = await visioXDetails
//       .find({
//         kithistory: { $exists: false }, // Look for systems where kithistory doesn't exist
//       })
//       .exec();

//     console.log(
//       `${visionXSystems.length} VisionX systems found without kithistory.`
//     );

//     // Iterate over the found VisionX systems and update the cameras within them
//     let updatedCount = 0;

//     for (let visionXSystem of visionXSystems) {
//       let systemUpdated = false; // Flag to check if any updates are made for this VisionX system

//       // Check if kithistory is missing or empty, initialize it
//       if (!visionXSystem.kithistory || visionXSystem.kithistory.length === 0) {
//         const currentTimestamp = moment()
//           .tz("Asia/Kolkata")
//           .format("dddd, MMMM D, YYYY hh:mm:ss A");

//         // Initialize kithistory with the current timestamp
//         visionXSystem.kithistory = [{ kitUpdatedTimes: currentTimestamp }];
//         systemUpdated = true;

//         console.log(
//           `Initialized kithistory for VisionX ID: ${visionXSystem.visionXId}`
//         );
//       }

//       // Iterate through cameras and set their kitStatus to 'working' (or other default action)
//       for (let camera of visionXSystem.cameraStatuses) {
//         // Ensure camera's kitStatus is 'working' if not already set
//         if (!camera.kitStatus) {
//           camera.kitStatus = "working";
//         }

//         // Update kithistory if it has not been initialized
//         if (!camera.kithistory || camera.kithistory.length === 0) {
//           const currentTimestamp = moment()
//             .tz("Asia/Kolkata")
//             .format("dddd, MMMM D, YYYY hh:mm:ss A");

//           camera.kithistory = [{ kitUpdatedTimes: currentTimestamp }];
//           systemUpdated = true;

//           console.log(
//             `Initialized kithistory for Camera ${camera.cameraNumber} in VisionX ID: ${visionXSystem.visionXId}`
//           );
//         }
//       }

//       // Save the VisionX system if any updates were made
//       if (systemUpdated) {
//         await visionXSystem.save();
//         updatedCount++;
//       }
//     }

//     console.log(`Migration complete: Updated ${updatedCount} VisionX systems.`);
//   } catch (error) {
//     console.error("Error during migration:", error);
//   }
// };

// // Run the migration function
// updateOldCameraDocuments().finally(() => mongoose.disconnect());
module.exports = connectDB;
