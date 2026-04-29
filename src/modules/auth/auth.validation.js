const Joi = require("joi");
const { password } = require("../../validations/custom.validation");
let authValidation = {};

authValidation.login = {
  body: Joi.object().keys({
    email: Joi.string().required("Email/Mobile is requried"),
    password: Joi.string().required("Password is required"),
  }),
};

authValidation.updatePassword = {
  body: Joi.object().keys({
    password: Joi.string().required("Current Password is required"),
    newPassword: Joi.string().required("New Password is required"),
  }),
};

authValidation.resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().required("Email is required"),
  }),
};

module.exports = authValidation;
