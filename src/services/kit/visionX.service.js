const { logger } = require("../../logger/logger");
const { CODES } = require("../../common/respose-code");
const { sendResponse } = require("../../common/common");
const PersonalInfo = require("../../models/PersonalInfo.model");
const moment = require("moment-timezone");
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
        cameraPosition: camera.cameraPosition,
        image: camera.image, // Image path will be passed from the controller
        createdat: camera.createdat,
        status: camera.status,
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

    if (!visionXId || !cameraStatuses || !Array.isArray(cameraStatuses)) {
      return sendResponse(
        CODES.BAD_REQUEST,
        "visionXId and cameraStatuses are required"
      );
    }

    // Update promises for each camera status and history
    const updatePromises = cameraStatuses.map(async (statusUpdate) => {
      const { ip, ...updates } = statusUpdate;

      // First, update the camera status (excluding history)
      const updatedStatus = await updateCameraStatus(
        VisionX,
        visionXId,
        ip,
        updates
      );

      // Then, update the camera history (add the timestamp)
      await updateCameraHistory(VisionX, visionXId, ip);

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

    // Optionally, determine the overall status based on the updates
    const overallStatus = checkCameraStatus(updatedVisionX.cameraStatuses);
    console.log(overallStatus);
    personalInfo.status = overallStatus;
    updatedVisionX.status = overallStatus;

    // Save the updated personal info and VisionX status
    await personalInfo.save();
    await updatedVisionX.save();

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
    const { ip, cameraPosition } = req.body; // Only the fields you mentioned
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
      image: req.file.path, // Store the image path from multer
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

module.exports = {
  newKitRegister,
  getKit,
  getKitsByCustomerId,
  updateKit,
  getbykitIds,
  deleteByKitId,
  updateByKitId,
  addCamera,
};
