const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const ispValidation = require('./isp.validation');
const ispController = require('./isp.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('isp.create'), validate(ispValidation.createIsp), ispController.createIsp)
    .get(auth('isp.view'), validate(ispValidation.getAllIsps), ispController.getAllisps);

router
    .route('/:id')
    .get(auth('isp.view'), validate(ispValidation.getIspById), ispController.getIspById)
    .patch(auth('isp.edit'), validate(ispValidation.updateIsp), ispController.updateIspById)
    .delete(auth('isp.delete'), validate(ispValidation.getIspById), ispController.deleteIspById);

router.get(
    '/server-down-alert/:id',
    auth('isp.view'),
    validate(ispValidation.getIspById),
    ispController.sendServerDownAlert
);

router.get(
    '/server-up-alert/:id',
    auth('isp.view'),
    validate(ispValidation.getIspById),
    ispController.sendServerUpAlert
);

module.exports = router;