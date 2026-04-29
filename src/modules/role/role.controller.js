const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const roleService = require('./role.service');
const StaffModel = require('../staff/staff.model');

const roleController = {};

roleController.createRole = catchAsync(async (req, res) => {
    // req.organizationId null hota hai master admin ke liye
    // is case mein user ki organizationId use karo
    const organizationId = req.organizationId || req.user?.organizationId;
    if (!organizationId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'organizationId is required');
    }
    const role = await roleService.createRole({ ...req.body, organizationId });
    res.status(httpStatus.CREATED).send(role);
});

roleController.getAllRoles = catchAsync(async (req, res) => {
    const organizationId = req.organizationId || req.user?.organizationId;
    const roles = await roleService.getAllRoles(organizationId);
    res.send(roles);
});

roleController.getRoleById = catchAsync(async (req, res) => {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    res.send(role);
});

roleController.updateRole = catchAsync(async (req, res) => {
    const requestingUser = req.user;

    if (requestingUser.roleId?.toString() === req.params.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You cannot modify your own role');
    }
    if (requestingUser.role === 'orgSuperAdmin') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Super Admin cannot modify roles');
    }

    const role = await roleService.updateRole(req.params.id, req.body);
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    res.send(role);
});

roleController.deleteRole = catchAsync(async (req, res) => {
    const staff = await StaffModel.find({ roleId: req.params.id });
    if (staff.length > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Role is assigned to staff members — cannot delete');
    }
    await roleService.deleteRole(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = roleController;