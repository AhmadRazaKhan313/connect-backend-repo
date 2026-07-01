const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const staffValidation = require('./staff.validation');
const staffController = require('./staff.controller');
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 5 }
});
const router = express.Router();

router
    .route('/')
    .post(auth('staff.create'), validate(staffValidation.createStaff), staffController.createStaff)
    .get(auth('staff.view'), validate(staffValidation.getAllStaff), staffController.getAllStaffs);

router.get(
    '/getAllPartners',
    auth('staff.view'),
    validate(staffValidation.getAllStaff),
    staffController.getAllPartners
);

// Self-service profile update (any authenticated account).
router.post(
    '/update-profile',
    upload.single('profileImage'),
    auth(),
    validate(staffValidation.updateProfile),
    staffController.updateProfile
);

router
    .route('/:id')
    .get(auth('staff.view'), validate(staffValidation.getStaffById), staffController.getStaff)
    .patch(auth('staff.edit'), validate(staffValidation.updateStaff), staffController.updateStaff)
    .delete(auth('staff.delete'), validate(staffValidation.getStaffById), staffController.deleteStaff);

module.exports = router;
