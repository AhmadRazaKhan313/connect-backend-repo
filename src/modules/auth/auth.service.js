const staffService = require("../staff/staff.service");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");

let authService = {};

authService.loginStaffWithEmailAndPassword = async (email, password) => {
  const staff = await staffService.getStaffByEmail(email);
  if (!staff) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect Email");
  }
  const isPasswordMatch = await bcrypt.compare(password, staff.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
  }
  return staff;
};

module.exports = authService;