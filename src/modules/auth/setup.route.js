const express = require('express');
const httpStatus = require('http-status');
const StaffModel = require('../staff/staff.model');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

const router = express.Router();

const MASTER_ORG_ID = '69e6ea81f25b8158cf1c62ac';

// GET /api/v1/auth/setup — check karo super admin exist karta hai ya nahi
router.get('/setup', catchAsync(async (req, res) => {
    const existing = await StaffModel.findOne({
        type: 'platformSuperAdmin',
        organizationId: MASTER_ORG_ID
    });
    res.send({ isSetupDone: !!existing });
}));

// POST /api/v1/auth/setup — pehla super admin create karo
router.post('/setup', catchAsync(async (req, res) => {
    // Pehle check karo — agar already exist karta hai toh block karo
    const existing = await StaffModel.findOne({
        type: 'platformSuperAdmin',
        organizationId: MASTER_ORG_ID
    });

    if (existing) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            'Setup already completed. Super admin already exists.'
        );
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name, email and password are required');
    }

    if (password.length < 6) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Password must be at least 6 characters');
    }

    const superAdmin = await StaffModel.create({
        fullname: name,
        email,
        password,
        type: 'platformSuperAdmin',
        role: 'platformSuperAdmin',
        organizationId: MASTER_ORG_ID,
        mobile: '00000000000',
        cnic: '0000000000000',
        address: 'N/A',
        share: 0,
    });

    res.status(httpStatus.CREATED).send({
        message: 'Super admin created successfully. You can now login.',
        email: superAdmin.email,
    });
}));

module.exports = router;
