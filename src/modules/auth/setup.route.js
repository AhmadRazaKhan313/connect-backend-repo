const express = require('express');
const httpStatus = require('http-status');
const StaffModel = require('../staff/staff.model');
const RoleModel = require('../role/role.model');
const Organization = require('../organization/organization.model');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const { ALL_PERMISSIONS } = require('../../config/permissions');

const router = express.Router();

router.get('/setup', catchAsync(async (req, res) => {
    const anyOrg = await Organization.findOne({});
    res.send({ isSetupDone: !!anyOrg });
}));

/**
 * POST /api/v1/auth/setup  one-time bootstrap (allowed only when no org exists).
 *
 * Creates the Platform Organization, its "Super Admin" role (ALL permissions,
 * including organization.* so it can manage other organizations), and the first
 * user assigned to that role. Nothing is hardcoded  the role is a DB document.
 */
router.post('/setup', catchAsync(async (req, res) => {
    const existing = await Organization.findOne({});
    if (existing) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Setup already completed. An organization already exists.');
    }

    const {
        orgName, orgEmail, subdomain, primaryColor, secondaryColor,
        adminName, adminEmail, adminPassword,
    } = req.body;

    if (!orgName || !orgEmail || !subdomain || !adminName || !adminEmail || !adminPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');
    }
    if (adminPassword.length < 6) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Password must be at least 6 characters');
    }

    const org = await Organization.create({
        name: orgName,
        email: orgEmail,
        subdomain,
        primaryColor: primaryColor || '#f07911',
        secondaryColor: secondaryColor || '#424242',
        mobile: '00000000000',
        address: 'N/A',
        status: 'active',
        isPlatform: true,
    });

    try {
        const platformRole = await RoleModel.create({
            name: 'Super Admin',
            permissions: ALL_PERMISSIONS,
            organizationId: org._id,
        });

        await StaffModel.create({
            fullname: adminName,
            email: adminEmail,
            password: adminPassword,
            roleId: platformRole._id,
            organizationId: org._id,
            mobile: '00000000000',
            cnic: '0000000000000',
            address: 'N/A',
            isPartner: false,
            share: 0,
        });
    } catch (staffErr) {
        await RoleModel.deleteMany({ organizationId: org._id });
        await Organization.deleteOne({ _id: org._id });
        throw new ApiError(httpStatus.BAD_REQUEST, staffErr.message || 'Failed to create platform admin');
    }

    res.status(httpStatus.CREATED).send({
        message: `Setup complete! Login at ${subdomain}.localhost:3000`,
        subdomain,
    });
}));

module.exports = router;
