const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const roleService = require('./role.service');
const StaffModel = require('../staff/staff.model');
const PERMISSIONS = require('../../config/permissions');

const roleController = {};

// All permissions list
const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// System roles — yeh DB mein nahi hain, built-in hain
const SYSTEM_ROLES = [
    {
        id: 'system-platformSuperAdmin',
        name: 'Platform Super Admin',
        isSystem: true,
        permissions: ALL_PERMISSIONS,
        description: 'Full platform access — manages all organizations and ISPs'
    },
    {
        id: 'system-orgSuperAdmin',
        name: 'Org Super Admin',
        isSystem: true,
        permissions: ALL_PERMISSIONS,
        description: 'Full access within their organization'
    },
    {
        id: 'system-orgAdmin',
        name: 'Org Admin',
        isSystem: true,
        permissions: ALL_PERMISSIONS,
        description: 'Admin access within their organization'
    },
];

roleController.createRole = catchAsync(async (req, res) => {
    const organizationId = req.organizationId || req.user?.organizationId;
    if (!organizationId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'organizationId is required');
    }
    const role = await roleService.createRole({ ...req.body, organizationId });
    res.status(httpStatus.CREATED).send(role);
});

roleController.getAllRoles = catchAsync(async (req, res) => {
    const organizationId = req.organizationId || req.user?.organizationId;
    const dbRoles = await roleService.getAllRoles(organizationId);

    // System roles + DB custom roles milao
    const allRoles = [...SYSTEM_ROLES, ...dbRoles];
    res.send(allRoles);
});

roleController.getRoleById = catchAsync(async (req, res) => {
    // System role check
    if (req.params.id.startsWith('system-')) {
        const sysRole = SYSTEM_ROLES.find(r => r.id === req.params.id);
        if (!sysRole) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
        return res.send(sysRole);
    }
    const role = await roleService.getRoleById(req.params.id);
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    res.send(role);
});

roleController.updateRole = catchAsync(async (req, res) => {
    const requestingUser = req.user;

    // System roles edit nahi ho sakti
    if (req.params.id.startsWith('system-')) {
        throw new ApiError(httpStatus.FORBIDDEN, 'System roles cannot be modified');
    }

    // Staff apna role modify nahi kar sakta
    if (requestingUser.roleId?.toString() === req.params.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You cannot modify your own role');
    }

    const role = await roleService.updateRole(req.params.id, req.body);
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    res.send(role);
});

roleController.deleteRole = catchAsync(async (req, res) => {
    // System roles delete nahi ho sakti
    if (req.params.id.startsWith('system-')) {
        throw new ApiError(httpStatus.FORBIDDEN, 'System roles cannot be deleted');
    }

    const staff = await StaffModel.find({ roleId: req.params.id });
    if (staff.length > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Role is assigned to staff members — cannot delete');
    }
    await roleService.deleteRole(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});


// Sirf DB custom roles — system roles nahi
// Staff assign dropdown ke liye use hota hai
roleController.getCustomRoles = catchAsync(async (req, res) => {
    const organizationId = req.organizationId || req.user?.organizationId;
    const dbRoles = await roleService.getAllRoles(organizationId);
    res.send(dbRoles);
});

module.exports = roleController;