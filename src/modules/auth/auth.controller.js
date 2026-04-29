const { tokenService, authService, staffService } = require("../../services");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcryptjs");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const { sendEmailByInfo } = require("../../services/email.service");
const { OrganizationModel } = require("../../models");

let authController = {};

authController.login = catchAsync(async (req, res) => {
    const { email, password } = req?.body;
    const user = await authService.loginStaffWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    user.password = null;

    let subdomain = null;
    if (user.organizationId) {
        const org = await OrganizationModel.findById(user.organizationId);
        subdomain = org?.subdomain || null;
    }

    res.send({ user, tokens, subdomain });
});

authController.updatePassword = catchAsync(async (req, res) => {
  const { password, newPassword } = req?.body;
  const user = req?.user;
  const isPasswordMatch = await bcrypt.compare(password, user?.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
  } else {
    const np = await bcrypt.hash(newPassword, 8);
    const result = await staffService.updatePassword(user?.id, np);
    res.send({ result });
  }
});

authController.resetPassword = catchAsync(async (req, res) => {
  const { email } = req?.body;
  const staff = await staffService.getStaffByEmail(email);
  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  } else {
    const password = `123${email.substring(0, email.indexOf("@"))}`;
    const newPassword = await bcrypt.hash(password, 8);
    const result = await staffService.updatePassword(staff?.id, newPassword);
    // await sendEmailByInfo(
    //   email,
    //   "Reset Password",
    //   `Your new password is ${password}. Kindly do not share it to anyone.`
    // );
    res.send({ result });
  }
});

module.exports = authController;
