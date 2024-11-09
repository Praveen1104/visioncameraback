const express = require("express");
const { getAdmin } = require("../controller/personalInfo.controller");
const adminRouter = express.Router();

adminRouter.post("/admin-login", getAdmin);

module.exports = { adminRouter };
