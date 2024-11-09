const express = require("express");
const {
  UserRegister,
  UserLogin,
  getuserDetailsByID,
  customerDeleteById,
  customerUpdateId,
} = require("../controller/personalInfo.controller");
const { getUsers } = require("../controller/personalInfo.controller");
const customerRouter = express.Router();


const { uploadImages } = require("../middleware/multerConfig");

customerRouter.post("/Register", UserRegister);
customerRouter.post("/login", UserLogin);

customerRouter.post("/new",uploadImages, UserRegister);
customerRouter.get("/get-info", getUsers);
customerRouter.get("/get-info/:id", getuserDetailsByID);
customerRouter.delete("/customer-delete/:id", customerDeleteById);
customerRouter.patch("/customer-update/:id", customerUpdateId);

module.exports = { customerRouter };
