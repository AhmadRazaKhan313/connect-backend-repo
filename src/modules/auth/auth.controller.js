const { tokenService, authService, staffService } = require("../../services");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcryptjs");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const { sendEmailByInfo } = require("../../services/email.service");
const { OrganizationModel } = require("../../models");
const roleService = require("../role/role.service");

let authController = {};

// ── Helper: orgStaff ka roleId se permissions array fetch karo ──────────────
const getStaffPermissions = async (user) => {
    // orgSuperAdmin / orgAdmin / platformSuperAdmin — full access, permissions array ki zaroorat nahi
    if (user.type !== 'orgStaff') return null;
    if (!user.roleId) return [];
    try {
        const role = await roleService.getRoleById(user.roleId);
        return Array.isArray(role?.permissions) ? role.permissions : [];
    } catch (_) {
        return [];
    }
};

authController.login = catchAsync(async (req, res) => {
    const { email, password } = req?.body;
    const user = await authService.loginStaffWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    user.password = null;

    let subdomain = null;
    let isHQ = false;
    if (user.organizationId) {
        const org = await OrganizationModel.findById(user.organizationId).lean();
        subdomain = org?.subdomain || null;
        isHQ = org?.isHQ === true;
    }

    // orgStaff ke liye permissions bhi bhejo — sidebar filtering ke liye
    const permissions = await getStaffPermissions(user);

    res.send({ user, tokens, subdomain, isHQ, permissions });
});

// GET /auth/me — fresh user + permissions return karo
// AppContextContainer isko route change pe call karta hai
authController.getMe = catchAsync(async (req, res) => {
    const user = req.user; // auth() middleware ne already DB se fresh load kiya hai
    user.password = undefined;

    let subdomain = null;
    let isHQ = false;
    if (user.organizationId) {
        const org = await OrganizationModel.findById(user.organizationId).lean();
        subdomain = org?.subdomain || null;
        isHQ = org?.isHQ === true;
    }

    const permissions = await getStaffPermissions(user);

    res.send({ user, isHQ, subdomain, permissions });
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

authController.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const { tokenTypes } = require('../../config/tokens');
  const { Token } = require('../../models');

  const tokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
  const staff = await staffService.getStaffById(tokenDoc.user);
  if (!staff) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
  }

  await Token.deleteOne({ _id: tokenDoc._id });
  const tokens = await tokenService.generateAuthTokens(staff);
  res.send({ tokens });
});

authController.logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const { tokenTypes } = require('../../config/tokens');
  const { Token } = require('../../models');

  const tokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
  await Token.deleteOne({ _id: tokenDoc._id });
  res.status(204).send();
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