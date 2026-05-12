const express = require('express');
const auth = require('../../middlewares/auth');
const roleController = require('./role.controller');

const router = express.Router();

router.get('/custom-only', auth(), roleController.getCustomRoles);

router
    .route('/')
    .post(auth(), roleController.createRole)
    .get(auth(), roleController.getAllRoles);

router
    .route('/:id')
    .get(auth(), roleController.getRoleById)
    .put(auth(), roleController.updateRole)
    .delete(auth(), roleController.deleteRole);

module.exports = router;