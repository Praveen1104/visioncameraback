const { logger } = require("../../logger/logger");
const { CODES } = require("../../common/respose-code");
const { sendResponse } = require("../../common/common");
const { response } = require("express");

// Function to fetch user information
const getUserInfo = (userModel) => async (req) => {
  try {
    logger.info("Fetching user information");
    const response = await userModel.find({});

    // Check if response is empty
    if (!response || response.length === 0) {
      logger.info("No users found");
      return sendResponse(CODES.NOT_FOUND, "No users found");
    }

    return sendResponse(CODES.OK, response);
  } catch (error) {
    logger.info(`Error fetching user information: ${error.message}`);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

// Function to fetch user information by ID
const getById = (userModel) => async (req) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching user information for Customer ID: ${id}`);

    // Query by customerId
    const response = await userModel.findOne({ customerId: id });

    if (!response) {
      logger.info(`User with Customer ID: ${id} not found`);
      return sendResponse(CODES.NOT_FOUND, "User not found");
    }

    return sendResponse(CODES.OK, response);
  } catch (error) {
    logger.info(`Error fetching user information: ${error.message}`);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

const personalInfoDeleteById = (userModel) => async (req) => {
  try {
    const { id } = req.params;
    console.log(id);
    logger.info(`Deleteing user information for Customer ID: ${id}`);
    const user = await userModel.findOne({ customerId: id });
    if (!user) {
      logger.info(`user with Customer ID : ${id} not found`);
      return sendResponse(CODES.NOT_FOUND, "User not found");
    }

    await userModel.deleteOne({ customerId: id }),
      logger.info(`User with Customer ID: ${id} deleted successfully`);

    return sendResponse(CODES.OK, "User deleted successfully");
  } catch (error) {
    logger.info(`Error fetching user information: ${error.message}`);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

const personalInfoUpdateById = (userModel) => async (req) => {
  try {
    const { id } = req.params;
    console.log(id);
    logger.info(`Updating user information for customer ID: ${id}`);

    // Use findOneAndUpdate to find by customerId
    const updatedUser = await userModel.findOneAndUpdate(
      { customerId: id }, // Find by customerId
      req.body, // Update with request body
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    console.log(updatedUser);

    if (!updatedUser) {
      logger.info(`User with Customer ID: ${id} not found`);
      return sendResponse(CODES.NOT_FOUND, "User not found");
    }

    return sendResponse(CODES.OK, updatedUser);
  } catch (error) {
    logger.info(`Error fetching user information: ${error.message}`);
    return sendResponse(CODES.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

// const personalInfoUpdateById = (userModel) => async (req) => {
//   try {
//     const { id } = req.params;
//     logger.info(`Updating user information for customer ID: ${id}`);

//     const updatedUser = await userModel.findByIdAndUpdate(
//       id, // Use `id` directly
//       req.body, // Ensure you're passing the update data
//       { new: true }
//     );

//     if (!updatedUser) {
//       logger.info(`User with Customer ID: ${id} not found`);
//       return sendResponse(CODES.NOT_FOUND, "User not found");
//     }

//     return sendResponse(CODES.OK, updatedUser);
//   } catch (error) {
//     logger.error(`Error fetching user information: ${JSON.stringify(error)}`);
//     return sendResponse(CODES.INTERNAL_SERVER_ERROR, "Internal Server Error");
//   }
// };

module.exports = {
  getUserInfo,
  getById,
  personalInfoDeleteById,
  personalInfoUpdateById,
};
