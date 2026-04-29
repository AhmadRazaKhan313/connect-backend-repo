const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('./user.validation');
const userController = require('./user.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('user.create'), validate(userValidation.createUser), userController.createUser)
    .get(auth('user.view'), validate(userValidation.getAllUsers), userController.getAllUsers);

router
    .route('/:id')
    .get(auth('user.view'), validate(userValidation.getUser), userController.getUser)
    .patch(auth('user.edit'), validate(userValidation.updateUser), userController.updateUserById)
    .delete(auth('user.delete'), validate(userValidation.getUser), userController.deleteUserById);

router.post(
    '/send-custom-message',
    auth('user.view'),
    validate(userValidation.sendCustomMessage),
    userController.sendCustomMessage
);

router.post(
    '/autocomplete',
    auth('user.view'),
    validate(userValidation.getAutoCompleteUsers),
    userController.getAutoCompleteUsers
);

module.exports = router;
