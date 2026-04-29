const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const packageValidation = require('./package.validation');
const packageController = require('./package.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('package.create'), validate(packageValidation.createPackage), packageController.createPackage)
    .get(auth('package.view'), validate(packageValidation.getAllPackages), packageController.getAllPackages);

router
    .route('/:id')
    .get(auth('package.view'), validate(packageValidation.getPackageById), packageController.getPackageById)
    .patch(auth('package.edit'), validate(packageValidation.updatePackage), packageController.updatePackageById)
    .delete(auth('package.delete'), validate(packageValidation.getPackageById), packageController.deletePackageById);

router.get('/by-isp/:isp', auth('package.view'), validate(packageValidation.getPackageByIsp), packageController.getPackageByIsp);

module.exports = router;
