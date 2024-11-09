const mongoose = require("mongoose");

const adminLoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const AdminLogin = (module.exports = mongoose.model(
  "AdminLogin",
  adminLoginSchema
));

module.exports = AdminLogin;
