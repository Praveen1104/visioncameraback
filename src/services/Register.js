const { CODES } = require("../common/respose-code");
const { sendResponse } = require("../common/common");
const { logger } = require("../logger/logger");

const generateCustomerId = async (Customer) => {
  const date = new Date();
  const dateString = date.toISOString().split("T")[0].replace(/-/g, "");


  const latestCustomer = await Customer.findOne({
    customerId: { $regex: `^QVX${dateString}` },
  })
  .sort({ customerId: -1 })
  .exec();

  let newCustomerNumber = 1;

  if (latestCustomer) {
    const lastCustomerNumber = parseInt(latestCustomer.customerId.split("-")[1], 10);
    newCustomerNumber = lastCustomerNumber + 1;
  }

  // Generate the new customer ID
  return `QVX${dateString}-${newCustomerNumber.toString().padStart(3, "0")}`;
};



const Register = (PersonalInfo) => async (req) => {
  const addressImagePath = req.files['addressImg'] ? req.files['addressImg'][0].path : null;
  const contentLogoPath = req.files['contentLogo'] ? req.files['contentLogo'][0].path : null;
  const contentImagePath = req.files['contentImage'] ? req.files['contentImage'][0].path : null;

  try {
    logger.info(req.body);
    console.log(req);
    logger.info("Checking whether email is already in the database");

    // Check if the email already exists
    const usernameExists = await PersonalInfo.findOne({
      email: req.body?.email,
    });
    logger.info(usernameExists);

    if (usernameExists) {
      return sendResponse(CODES.BAD_REQUEST, "Please use a different email");
    }

    // Generate the customer ID
    const customerId = await generateCustomerId(PersonalInfo);

    // Create a new user
    const user = await new PersonalInfo({
      customerId,
      contactNumber: req.body.contactNumber,
      name: req.body.name,
      password: customerId,
      status: req.body.status,
      address: req.body.address,
      email: req.body.email,
      pincode: req.body.pincode,
      addressImage: addressImagePath,
      content:req.body.content,
      contentLogo:contentLogoPath,
      contentImage:contentImagePath 
    }).save();
    

    return sendResponse(CODES.OK, "User signed up successfully",user);
  } catch (error) {
    logger.error(error);
    throw new Error("Error in Signup API Call");
  }
};

module.exports = { Register, generateCustomerId };
