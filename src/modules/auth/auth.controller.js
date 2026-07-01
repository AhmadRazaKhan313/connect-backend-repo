const { tokenService, authService, staffService } = require("../../services");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const { OrganizationModel } = require("../../models");
const RoleModel = require("../role/role.model");

let authController = {};

// Effective permissions for an account = its role's permissions.
const loadPermissions = async (user) => {
    if (!user?.roleId) return [];
    const role = await RoleModel.findById(user.roleId).lean();
    return role && Array.isArray(role.permissions) ? role.permissions : [];
};

const buildOrgMeta = async (user) => {
    let subdomain = null;
    let isPlatform = false;
    if (user.organizationId) {
        const org = await OrganizationModel.findById(user.organizationId).lean();
        subdomain = org?.subdomain || null;
        isPlatform = org?.isPlatform === true;
    }
    return { subdomain, isPlatform };
};

authController.login = catchAsync(async (req, res) => {
    const { email, password } = req?.body;
    const user = await authService.loginStaffWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);

    const permissions = await loadPermissions(user);
    const { subdomain, isPlatform } = await buildOrgMeta(user);
    user.password = null;

    res.send({ user, tokens, subdomain, isPlatform, permissions });
});

// GET /auth/me  fresh account + permissions (used by the client on route changes).
authController.getMe = catchAsync(async (req, res) => {
    const user = req.user; // auth() middleware loaded a fresh copy + permissions
    const permissions = Array.isArray(user?.permissions) ? user.permissions : await loadPermissions(user);
    if (user) user.password = undefined;

    const { subdomain, isPlatform } = await buildOrgMeta(user);
    res.send({ user, isPlatform, subdomain, permissions });
});

authController.updatePassword = catchAsync(async (req, res) => {
    const { password, newPassword } = req?.body;
    const user = req?.user;
    const isPasswordMatch = await bcrypt.compare(password, user?.password);
    if (!isPasswordMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
    }
    const np = await bcrypt.hash(newPassword, 8);
    const result = await staffService.updatePassword(user?.id, np);
    res.send({ result });
});

authController.refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    const { tokenTypes } = require('../../config/tokens');
    const { Token } = require('../../models');

    const tokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const staff = await staffService.getStaffById(tokenDoc.user);
    if (!staff) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Account not found');
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
        throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
    }
    const tempPassword = crypto.randomBytes(9).toString("base64url");
    const hashed = await bcrypt.hash(tempPassword, 8);
    await staffService.updatePassword(staff?.id, hashed);
    // Deliver `tempPassword` via email/SMS once that channel is configured.
    res.send({ message: "A temporary password has been generated. Please contact your administrator." });
});

module.exports = authController;
