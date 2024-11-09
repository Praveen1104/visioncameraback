const { Login } = require("../services/Login");
const { Register } = require("../services/Register");
const { adminLogin } = require("../services/Login");
const {
  getUserInfo,
  getById,
  personalInfoDeleteById,
  personalInfoUpdateById,
} = require("../services/customer/user.service");
const { logger } = require("../logger/logger");
const PersonalInfo = require("../models/PersonalInfo.model");
const AdminLogin = require("../models/AdminLogin.model");

const UserRegister = async (req, res) => {
  const UserRegisterService = Register(PersonalInfo);
  const responseMessage = await UserRegisterService(req);
  logger.info(`Signup api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const UserLogin = async (req, res) => {
  const userLoginService = Login(PersonalInfo);
  const responseMessage = await userLoginService(req);
  logger.info(`Login api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const getUsers = async (req, res) => {
  const userInfoService = getUserInfo(PersonalInfo);
  const responseMessage = await userInfoService(req);
  logger.info(`getUserInfo api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const getuserDetailsByID = async (req, res) => {
  const userGetById = getById(PersonalInfo);
  const responseMessage = await userGetById(req);
  logger.info(`getUserById api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};

//admin login
const getAdmin = async (req, res) => {
  const adminLoginService = adminLogin(AdminLogin);
  const responseMessage = await adminLoginService(req);
  logger.info(`Admin Login api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const customerDeleteById = async (req, res) => {
  console.log(req.params);
  const userDeleteById = personalInfoDeleteById(PersonalInfo);
  const responseMessage = await userDeleteById(req);
  logger.info(`getDeleteById api Executed`);
  res.status(responseMessage.status).json(responseMessage);
};

const customerUpdateId = async (req, res) => {
  console.log(req.params);
  const userUpdateById = personalInfoUpdateById(PersonalInfo);
  const responseMessage = await userUpdateById(req);
  logger.info(`getUpdateById api Executed`);
  res.json(responseMessage);
};
// Exporting the functions using CommonJS
module.exports = {
  UserLogin,
  UserRegister,
  getAdmin,
  getUsers,
  getuserDetailsByID,
  customerDeleteById,
  customerUpdateId,
};
