const { logger } = require("../../logger/logger");
const { CODES } = require("../../common/respose-code");
const { sendResponse } = require("../../common/common");
const PersonalInfo = require("../../models/PersonalInfo.model");
const moment = require("moment-timezone");
const historyModel = require("../../models/history.model");
const validCoverageStatuses = ["Screen is interrupted", "None", "Error"];
const checkCameraStatus = (cameraStatuses) => {
  console.log(cameraStatuses);
  const inactiveCameras = cameraStatuses.filter(
    (camera) =>
      camera.status == "Offline" ||
      validCoverageStatuses.includes(camera.Coverage)
  );
  console.log(inactiveCameras.length);
  return inactiveCameras.length == 0;
};
// Register a new kit
const newKitRegister = (VisionX) => async (req) => {
  try {
    logger.info(req.body);

    // Save the kit details, including camera images
    const kit = await new VisionX({
      customerId: req.body.customerId,
      visionXId: req.body.visionXId,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      location: req.body.location,
      status: true,
      numberOfCameras: req.body.numberOfCameras,
      cameraStatuses: req.body.cameraStatuses.map((camera) => ({
        ip: camera.ip,
        camera_ip: camera.camera_ip,
        cameraPosition: camera.cameraPosition,
        image: camera.image, // Image path will be passed from the controller
        createdat: camera.createdat,
        status: "Online",
        Coverage: "Screen not interrupted",
      })),
    }).save();
    const hisorykit = await new historyModel({
      customerId: req.body.customerId,
      visionXId: req.body.visionXId,
      location: req.body.location,
      status: true,
      numberOfCameras: req.body.numberOfCameras,
      cameraStatuses: req.body.cameraStatuses.map((camera) => ({
        ip: camera.ip,
        camera_ip: camera.camera_ip,
        cameraPosition: camera.cameraPosition,
        createdat: camera.createdat,
        status: "Online",
        Coverage: "Screen not interrupted",
      })),
    }).save();
    return sendResponse(CODES.OK, "Kit registered successfully", kit);
  } catch (error) {
    logger.error(error);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};
const getKit = (VisionX) => async (req) => {
  try {
    const { id } = req.params;

    logger.info("Fetching camera statuses for kit", id);

    const kit = await VisionX.findOne({ visionXId: id });

    console.log(kit);

    if (!kit) {
      return sendResponse(CODES.NOT_FOUND, "Kit not found");
    }

    return sendResponse(CODES.OK, "Camera statuses found", kit);
  } catch (error) {
    logger.error(error);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};
const getKitsByCustomerId = (VisionX) => async (req) => {
  try {
    console.log(req.params);
    const { id } = req.params;
    // console.log(customerId);
    const kits = await VisionX.find({ customerId: id });
    if (!kits?.response?.length < 0) {
      return sendResponse(
        CODES.NOT_FOUND,
        `No Kit Found For This CutomerId:${id}`
      );
    }
    console.log(kits);
    return sendResponse(CODES.OK, "Success", kits);
  } catch (error) {
    logger.error(error);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};
const getbykitIds = (VisionX) => async (req) => {
  try {
    const { id } = req.params;

    logger.info("Fetching camera statuses for kit", id);

    const kit = await VisionX.findOne({ visionXId: id });

    if (!kit) {
      return sendResponse(CODES.NOT_FOUND, "Kit not found");
    }

    return sendResponse(CODES.OK, "Camera statuses found", kit);
  } catch (error) {
    logger.error(error);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};
function format12HourTimeWithDateAndTimezone(date, timezone = "Asia/Kolkata") {
  return moment(date).tz(timezone).format("dddd, MMMM D, YYYY hh:mm:ss A");
}
const updateCameraStatus = async (VisionX, visionXId, ip, updates) => {
  // Build the update query for camera status updates (excluding history)
  const updateFields = {};
  for (let key in updates) {
    console.log(key, updates[key]);
    updateFields[`cameraStatuses.$.${key}`] = updates[key];
  }

  // Perform the update on the camera status
  const updatedDocument = await VisionX.findOneAndUpdate(
    { visionXId, "cameraStatuses.ip": ip },
    { $set: updateFields },
    { new: true } // Return the updated document
  );
  console.log(updatedDocument);
  return updatedDocument;
};

const updateCameraHistory = async (VisionX, visionXId, ip) => {
  // Get formatted time in 12-hour format with timezone
  const formattedTime = format12HourTimeWithDateAndTimezone(new Date());

  // Push the new timestamp to the camera's history
  const updateHistory = {
    $push: {
      "cameraStatuses.$.history": {
        updatedTimes: formattedTime,
        timestamp: new Date(), // Store the actual Date object for record keeping
      },
    },
  };

  // Perform the history update on the camera status
  const updatedDocument = await VisionX.findOneAndUpdate(
    { visionXId, "cameraStatuses.ip": ip },
    updateHistory,
    { new: true } // Return the updated document
  );

  return updatedDocument;
};

const updateKit = (VisionX) => async (req) => {
  try {
    const { visionXId, cameraStatuses } = req.body;
    logger.info(`Updating status for VisionX ID: ${visionXId}`);
    console.log(cameraStatuses);
    if (!visionXId || !cameraStatuses || !Array.isArray(cameraStatuses)) {
      return sendResponse(
        CODES.BAD_REQUEST,
        "visionXId and cameraStatuses are required"
      );
    }

    // Update promises for each camera status and history
    const updatePromises = cameraStatuses.map(async (statusUpdate) => {
      const { ip, ...updates } = statusUpdate;
      console.log("camerassssssssssssssssssssssss", updates);
      // First, update the camera status (excluding history)
      const updatedStatus = await updateCameraStatus(
        VisionX,
        visionXId,
        ip,
        updates
      );
      const historyStatus = await updateCameraStatus(
        historyModel,
        visionXId,
        ip,
        updates
      );
      // Then, update the camera history (add the timestamp)
      await updateCameraHistory(historyModel, visionXId, ip);

      return updatedStatus; // Return updated status after both operations
    });

    // Wait for all updates to finish
    await Promise.all(updatePromises);

    // Fetch the updated VisionX document once after all updates
    const updatedVisionX = await VisionX.findOne({ visionXId });
    if (!updatedVisionX) {
      return sendResponse(CODES.NOT_FOUND, "VisionX document not found");
    }

    // Fetch personal information
    const customerId = updatedVisionX.customerId;
    const personalInfo = await PersonalInfo.findOne({ customerId });
    if (!personalInfo) {
      return sendResponse(CODES.NOT_FOUND, "Personal information not found");
    }
    const kitInfo = await VisionX.find({ customerId });
    if (!kitInfo) {
      return sendResponse(CODES.NOT_FOUND, "Personal information not found");
    }

    // Optionally, determine the overall status based on the updates
    const overallStatus = checkCameraStatus(updatedVisionX.cameraStatuses);
    // personalInfo.status = overallStatus;
    updatedVisionX.status = overallStatus;

    // Save the updated personal info and VisionX status
    // await personalInfo.save();
    await updatedVisionX.save();
    const allKitsWorking = kitInfo.every((kit) => kit.status == true);
    if (allKitsWorking) {
      // 3. If all kits are working, update the PersonalInfo status to true
      const personalInfostatus = await PersonalInfo.findOneAndUpdate(
        { customerId }, // Find the personal info by customerId
        { status: true }, // Set the status to true
        { new: true } // Return the updated document
      );

      if (!personalInfostatus) {
        // If no personal info found, send NOT_FOUND response
        return sendResponse(CODES.NOT_FOUND, "Personal information not found");
      }

      // If personal info was updated successfully
    }
    // Return the updated VisionX document
    return sendResponse(
      CODES.OK,
      "Camera status updated successfully",
      updatedVisionX // Return the updated document just once
    );
  } catch (error) {
    logger.error(error);
    throw new Error("Error in updating camera status");
  }
};

// const updateCameraStatus = async (VisionX, visionXId, ip, updates) => {
//   const updateFields = {};
//   for (let key in updates) {
//     updateFields[`cameraStatuses.$.${key}`] = updates[key];
//   }

//   const updatedDocument = await VisionX.findOneAndUpdate(
//     { visionXId, "cameraStatuses.ip": ip },
//     { $set: updateFields },
//     { new: true }
//   );

//   return updatedDocument;
// };

// const updateCameraHistory = async (VisionX, visionXId, ip) => {
//   const formattedTime = format12HourTimeWithDateAndTimezone(new Date());
//   const updateHistory = {
//     $push: {
//       "cameraStatuses.$.history": {
//         updatedTimes: formattedTime,
//         timestamp: new Date(),
//       },
//     },
//   };

//   const updatedDocument = await VisionX.findOneAndUpdate(
//     { visionXId, "cameraStatuses.ip": ip },
//     updateHistory,
//     { new: true }
//   );

//   return updatedDocument;
// };

// const fetchCustomerData = async (customerId) => {
//   const personalInfo = await PersonalInfo.findOne({ customerId });
//   if (!personalInfo) {
//     throw new Error("Personal information not found");
//   }

//   const kitInfo = await VisionX.find({ customerId });
//   if (!kitInfo.length) {
//     throw new Error("No VisionX kits found for the customer");
//   }

//   return { personalInfo, kitInfo };
// };

// const updateKit = (VisionX) => async (req) => {
//   try {
//     const { visionXId, cameraStatuses } = req.body;
//     logger.info(`Updating status for VisionX ID: ${visionXId}`);

//     if (!visionXId || !cameraStatuses || !Array.isArray(cameraStatuses)) {
//       return sendResponse(
//         CODES.BAD_REQUEST,
//         "visionXId and cameraStatuses are required"
//       );
//     }

//     const updatePromises = cameraStatuses.map(async (statusUpdate) => {
//       const { ip, ...updates } = statusUpdate;

//       // Update status and history
//       await updateCameraStatus(VisionX, visionXId, ip, updates);
//       await updateCameraHistory(VisionX, visionXId, ip);
//     });

//     await Promise.all(updatePromises);

//     const updatedVisionX = await VisionX.findOne({ visionXId });
//     if (!updatedVisionX) {
//       return sendResponse(CODES.NOT_FOUND, "VisionX document not found");
//     }

//     const { customerId } = updatedVisionX;
//     const { personalInfo, kitInfo } = await fetchCustomerData(customerId);

//     // Determine overall status
//     const overallStatus = checkCameraStatus(updatedVisionX.cameraStatuses);
//     updatedVisionX.status = overallStatus;

//     // Check if all kits are working
//     const allKitsWorking = kitInfo.every((kit) => kit.status === true);
//     if (allKitsWorking) {
//       personalInfo.status = true;
//       await personalInfo.save();
//     }

//     await updatedVisionX.save();

//     return sendResponse(
//       CODES.OK,
//       "Camera status updated successfully",
//       updatedVisionX
//     );
//   } catch (error) {
//     logger.error("Error in updating camera status:", error);
//     return sendResponse(CODES.INTERNAL_SERVER_ERROR, error.message);
//   }
// };

// const updateKit = (VisionX) => async (req) => {
//   try {
//     const { visionXId, cameraStatuses } = req.body;
//     logger.info(`Updating status for VisionX ID: ${visionXId}`);

//     if (!visionXId || !cameraStatuses || !Array.isArray(cameraStatuses)) {
//       return sendResponse(
//         CODES.BAD_REQUEST,
//         "visionXId and cameraStatuses are required"
//       );
//     }

//     // Build the update queries for each camera status to be updated
//     const updatePromises = cameraStatuses.map(async (statusUpdate) => {
//       const { ip, ...updates } = statusUpdate;
//       const updateFields = {};

//       for (let key in updates) {
//         console.log(key, updates[key]);
//         updateFields[`cameraStatuses.$.${key}`] = updates[key];
//       }

//       // Get the formatted timestamp using moment
//       const formattedTime = format12HourTimeWithDateAndTimezone(new Date()); // Get formatted time in 12-hour format

//       // Add the formatted timestamp to the camera's history
//       updateFields["cameraStatuses.$.history"] = {
//         updatedTimes: formattedTime,
//       };

//       // Perform the update and push the history to the camera's status
//       await VisionX.findOneAndUpdate(
//         { visionXId, "cameraStatuses.ip": ip },
//         {
//           $push: {
//             "cameraStatuses.$.history": { updatedTimes: formattedTime },
//           },
//         },
//         { new: true } // Return the updated document
//       );
//     });

//     // Wait for all updates to finish
//     await Promise.all(updatePromises);

//     // Fetch the updated VisionX document once after all updates
//     const updatedVisionX = await VisionX.findOne({ visionXId });
//     if (!updatedVisionX) {
//       return sendResponse(CODES.NOT_FOUND, "VisionX document not found");
//     }

//     // Fetch personal information
//     const customerId = updatedVisionX.customerId;
//     const personalInfo = await PersonalInfo.findOne({ customerId });
//     if (!personalInfo) {
//       return sendResponse(CODES.NOT_FOUND, "Personal information not found");
//     }

//     // Optionally, determine the overall status based on the updates
//     const overallStatus = checkCameraStatus(updatedVisionX.cameraStatuses);
//     console.log(overallStatus);
//     personalInfo.status = overallStatus;
//     updatedVisionX.status = overallStatus;

//     await personalInfo.save();
//     await updatedVisionX.save();

//     return sendResponse(
//       CODES.OK,
//       "Camera status updated successfully",
//       updatedVisionX // Return the updated document just once
//     );
//   } catch (error) {
//     logger.error(error);
//     throw new Error("Error in updating camera status");
//   }
// };
const deleteByKitId = (VisionX) => async (req) => {
  try {
    console.log("hi");
    const { id } = req.params;
    console.log(id);
    logger.info(`Deleteing Kit information for Customer ID: ${id}`);
    const user = await VisionX.findOne({ visionXId: id });
    if (!user) {
      logger.info(`Kit with ID : ${id} not found`);
      return sendResponse(CODES.NOT_FOUND, "Kit not found");
    }

    await VisionX.deleteOne({ visionXId: id }),
      logger.info(`kit ID: ${id} deleted successfully`);

    return sendResponse(CODES.OK, "Kit deleted successfully");
  } catch (error) {
    logger.info(`Error fetching user information: ${error.message}`);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

const updateByKitId = (VisionX) => async (req) => {
  try {
    const { id } = req.params;

    // console.log(req.body);
    logger.info(`Updating Kit information for Kit ID: ${id}`);
    const updateKitId = await VisionX.findOneAndUpdate(
      { visionXId: id },
      req.body,
      { new: true }
    );
    console.log(updateKitId);
    if (!updateKitId) {
      logger.info(`Kit with ID : ${id} not found`);
      return sendResponse(CODES.NOT_FOUND, "Kit not found");
    }

    logger.info(`kit ID: ${id} updated successfully`);
    return sendResponse(CODES.OK, "Kit updated successfully");
  } catch (error) {
    logger.info(`Error fetching user information: ${error.message}`);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

const addCamera = (VisionX) => async (req) => {
  try {
    const { visionXId } = req.body; // You might want to extract this from the body
    const { ip, cameraPosition, camera_ip } = req.body; // Only the fields you mentioned
    console.log(visionXId);
    logger.info("Adding camera status for VisionX ID", visionXId);

    // Validate required fields
    if (!visionXId || !ip || !cameraPosition) {
      return sendResponse(
        CODES.BAD_REQUEST,
        "visionXId, ip, and cameraPosition are required"
      );
    }

    // Create camera object with the incoming data
    const cameraData = {
      ip,
      cameraPosition,
      image: req.file.path,
      camera_ip,
      status: "Online",
      Coverage: "Screen not interrupted", // Store the image path from multer
    };
    const updatedCamera = await VisionX.findOneAndUpdate(
      { visionXId },
      { $push: { cameraStatuses: cameraData }, $inc: { numberOfCameras: 1 } },
      { new: true }
    );

    if (!updatedCamera) {
      return sendResponse(CODES.NOT_FOUND, "Kit not found");
    }

    return sendResponse(
      CODES.OK,
      "Camera status added successfully",
      updatedCamera
    );
  } catch (error) {
    logger.error(error);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};

const debounceTimers = {}; // In-memory object to store debounce timers

const DEBOUNCE_TIMEOUT = 10 * 60 * 1000; // 1 minute in milliseconds (60,000ms)

const checkAndUpdateKitStatus = (VisionX) => async (req, res) => {
  try {
    const { visionXId } = req.body; // Extract the visionXId from the request body
    console.log("Checking camera status for VisionX ID", visionXId);

    // Validate required fields
    if (!visionXId) {
      return sendResponse(CODES.INTERNAL_SERVER_ERROR, "visionXId is required");
    }

    // Get the camera system by VisionX ID
    const cameraSystem = await historyModel.findOne({ visionXId });

    if (!cameraSystem) {
      return sendResponse(
        CODES.INTERNAL_SERVER_ERROR,
        "Camera system not found"
      );
    }

    // Create a new timestamp entry for kithistory
    const createdTimestamp = moment()
      .tz("Asia/Kolkata")
      .format("dddd, MMMM D, YYYY hh:mm:ss A");
    console.log("Created timestamp:", createdTimestamp);

    // Ensure kithistory is initialized as an array if it's undefined
    if (!cameraSystem.kithistory) {
      cameraSystem.kithistory = [];
    }

    // Push the new timestamp into the kithistory array
    cameraSystem.kithistory.push({ kitUpdatedTimes: createdTimestamp });

    // Reset kitStatus to "working" since this API call is a valid update
    cameraSystem.kitStatus = "working";

    // Save the updated camera system with the new kithistory entry and kitStatus
    await cameraSystem.save(); // Save to persist the new kithistory entry

    // console.log("Updated kithistory:", cameraSystem.kithistory);
    console.log("Updated kitStatus:", cameraSystem.kitStatus);

    // Update debounce timer for the given visionXId (if not set, initialize it)
    clearTimeout(debounceTimers[visionXId]);

    // Set a new timer for this camera system to update kitStatus to "not working" after the debounce timeout
    debounceTimers[visionXId] = setTimeout(async () => {
      // If no more requests come in for this visionXId, set kitStatus to "not working"
      const cameraSystemToUpdate = await VisionX.findOne({ visionXId });

      if (cameraSystemToUpdate) {
        cameraSystemToUpdate.kitStatus = "not working"; // Set to "not working" after debounce timeout
        await cameraSystemToUpdate.save();
        console.log(
          `Kit status for VisionX ID ${visionXId} set to "not working" due to inactivity.`
        );
      }
    }, DEBOUNCE_TIMEOUT); // 1 minute debounce timeout

    // Return success response
    return sendResponse(CODES.OK, "kit Status  updated successfully");
  } catch (error) {
    console.error("Error updating kit Status :", error);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};

const eraseOldHistory = async (VisionX) => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // Find all documents with existing camera history
    const kits = await VisionX.find({
      "cameraStatuses.history.updatedTimes": { $exists: true },
    });

    for (const kit of kits) {
      // Update only the history field of each camera
      kit.cameraStatuses.forEach((camera) => {
        if (camera?.history) {
          camera.history = camera.history.filter((entry) => {
            const entryDate = new Date(entry.updatedTimes);
            return entryDate >= tenDaysAgo;
          });
        }
      });

      // Save the updated kit
      await kit.save();
    }

    console.log("Successfully erased history older than 10 days.");
  } catch (error) {
    console.error("Error erasing old history:", error);
  }
};

module.exports = {
  newKitRegister,
  getKit,
  getKitsByCustomerId,
  updateKit,
  getbykitIds,
  deleteByKitId,
  updateByKitId,
  addCamera,
  checkAndUpdateKitStatus,
  eraseOldHistory,
};
