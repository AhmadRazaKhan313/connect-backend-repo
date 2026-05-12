const express = require('express');
const httpStatus = require('http-status');
const StaffModel = require('../staff/staff.model');
const Organization = require('../organization/organization.model');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

const router = express.Router();

// GET /api/v1/auth/setup — 
router.get('/setup', catchAsync(async (req, res) => {
    const existing = await Organization.findOne({ isHQ: true });
    const anyOrg = await Organization.findOne({});
    res.send({ isSetupDone: !!anyOrg });
}));


router.post('/setup', catchAsync(async (req, res) => {
    const existing = await Organization.findOne({});
    if (existing) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            'Setup already completed. An organization already exists.'
        );
    }

    const { orgName, orgEmail, subdomain, primaryColor, secondaryColor, adminName, adminEmail, adminPassword } = req.body;

    if (!orgName || !orgEmail || !subdomain || !adminName || !adminEmail || !adminPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');
    }

    if (adminPassword.length < 6) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Password must be at least 6 characters');
    }

    // create Organization 
    const org = await Organization.create({
        name: orgName,
        email: orgEmail,
        subdomain,
        primaryColor: primaryColor || '#f07911',
        secondaryColor: secondaryColor || '#424242',
        secondaryColor: '#424242',
        mobile: '00000000000',
        address: 'N/A',
        status: 'active',
        isHQ: true,
        isHQ: true,
        features: {
            smsAlerts: true,
            invoicing: true,
            expenses: true,
            extraIncome: true,
            staffManagement: true,
            ispManagement: true,
            dashboard: true,
        }
    });

    // platformSuperAdmin for HQ organization — full platform access
    await StaffModel.create({
        fullname: adminName,
        email: adminEmail,
        password: adminPassword,
        type: 'platformSuperAdmin',
        role: 'platformSuperAdmin',
        organizationId: org._id,
        mobile: '00000000000',
        cnic: '0000000000000',
        address: 'N/A',
        share: 0,
    });

    res.status(httpStatus.CREATED).send({
        message: `Setup complete! Login at ${subdomain}.localhost:3000`,
        subdomain,
    });
}));

module.exports = router;