const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const ApiError = require("../../utils/ApiError");
const roleService = require("./role.service");
const StaffModel = require("../staff/staff.model");
const { sanitizePermissions } = require("../../config/permissions");
const { assertSameOrg } = require("../../utils/tenant");

const roleController = {};

roleController.createRole = catchAsync(async (req, res) => {
  const organizationId = req.organizationId;
  if (!organizationId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "organizationId is required");
  }

  const permissions = sanitizePermissions(req.body.permissions);
  if (!req.body.name || permissions.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role name and at least one permission are required");
  }

  const role = await roleService.createRole({
    name: req.body.name,
    permissions,
    organizationId,
    createdBy: req.user?._id || req.user?.id,
  });
  res.status(httpStatus.CREATED).send(role);
});

roleController.getAllRoles = catchAsync(async (req, res) => {
  // Roles are always scoped to the requester's own organization.
  const roles = await roleService.getAllRoles(req.organizationId);
  res.send(roles);
});

// Used by staff forms to populate the role dropdown (own org only).
roleController.getCustomRoles = catchAsync(async (req, res) => {
  const roles = await roleService.getAllRoles(req.organizationId);
  res.send(roles);
});

roleController.getRoleById = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  assertSameOrg(role, req, "Role");
  res.send(role);
});

roleController.updateRole = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  assertSameOrg(role, req, "Role");

  const update = {};
  if (req.body.name !== undefined) update.name = req.body.name;
  if (req.body.permissions !== undefined) {
    update.permissions = sanitizePermissions(req.body.permissions);
    if (update.permissions.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "A role must have at least one permission");
    }
  }

  const updated = await roleService.updateRole(req.params.id, update);
  res.send(updated);
});

roleController.deleteRole = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  assertSameOrg(role, req, "Role");

  // Cannot delete a role that is still assigned to any account.
  const assigned = await StaffModel.countDocuments({ roleId: req.params.id });
  if (assigned > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `This role is assigned to ${assigned} account(s) and cannot be deleted`
    );
  }

  await roleService.deleteRole(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = roleController;
