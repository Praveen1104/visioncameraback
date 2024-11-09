const { CODES } = require("../common/respose-code");
const { sendResponse } = require("../common/common");
const { logger } = require("../logger/logger");
const Login = (userConnection) => async (req) => {
  try {
    logger.info(`Checking if user exists or not`);
    const { customerId, password } = req.body;

    let userQuery = { customerId };
    const user = await userConnection.findOne(userQuery);
    console.log("-----", user);

    if (!user) {
      return sendResponse(CODES.UNAUTHORIZED, "Invalid customer");
    }

    // Compare the provided password with the stored password
    if (user.password !== password) {
      return sendResponse(CODES.UNAUTHORIZED, "Invalid password");
    }

    logger.info("Login Success!!!!");
    return sendResponse(CODES.OK, "User logged in successfully", user);
  } catch (err) {
    logger.error(`${err}`);
    throw new Error("Error in login API Call");
  }
};

const adminLogin = (AdminLogin) => async (req, res) => {
  try {
    const { email, password } = req.body;
    const getAdminCredentials = await AdminLogin.findOne({ email });

    if (!getAdminCredentials) {
      return sendResponse(CODES.NOT_FOUND, "No data found");
    }

    // If the password doesn't match, return an error message
    if (getAdminCredentials.password !== password) {
      return sendResponse(CODES.UNAUTHORIZED, "Invalid email or password");
    }

    // If email and password are correct
    return sendResponse(
      CODES.OK,
      "User logged in successfully",
      getAdminCredentials
    );
  } catch (error) {
    logger.error(`${error.message}`);
    throw new Error("Error in admin login API Call");
  }
};

module.exports = { Login, adminLogin };
