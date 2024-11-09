const express = require("express");
const { customerRouter } = require("./customerInfo.routes");
const { kitRouter } = require("./kit.route");
const { adminRouter } = require("./Login.routes");
const router = express.Router();

router.use("/customer", customerRouter);
router.use("/kit", kitRouter);
router.use("/admin", adminRouter);

module.exports = { router };
