const Joi = require("joi");
const { objectId, cnic, mobile } = require("../../validations/custom.validation");

let staffValidation = {};

staffValidation.createStaff = {
  body: Joi.object().keys({
    fullname: Joi.string().required().messages({ "any.required": "Full Name is required" }),
    email: Joi.string().required().email().messages({ "any.required": "Email is required" }),
    password: Joi.string().required().messages({ "any.required": "Password is required" }),
    cnic: Joi.string().required().custom(cnic).messages({ "any.required": "CNIC is required" }),
    mobile: Joi.string().required().custom(mobile).messages({ "any.required": "Mobile is required" }),
    address: Joi.string().required().messages({ "any.required": "Address is required" }),

    // Every account must be assigned a role.
    roleId: Joi.string().required().custom(objectId).messages({ "any.required": "A role is required" }),

    isPartner: Joi.boolean().default(false),
    share: Joi.number().min(0).max(100).when("isPartner", {
      is: true,
      then: Joi.number().required().messages({ "any.required": "Share is required for a Partner" }),
      otherwise: Joi.number().default(0),
    }),

    sendWelcomeMessage: Joi.boolean().required(),
  }),
};

staffValidation.getStaffById = {
  params: Joi.object().keys({ id: Joi.string().required().custom(objectId) }),
};

staffValidation.getAllStaff = { query: Joi.object().keys({}) };

staffValidation.updateStaff = {
  params: Joi.object().keys({ id: Joi.string().required().custom(objectId) }),
  body: Joi.object().keys({
    fullname: Joi.string().optional(),
    email: Joi.string().email().optional(),
    cnic: Joi.string().custom(cnic).optional(),
    mobile: Joi.string().custom(mobile).optional(),
    address: Joi.string().optional(),
    roleId: Joi.string().custom(objectId).optional(),
    isPartner: Joi.boolean().optional(),
    share: Joi.number().min(0).max(100).optional(),
    sendWelcomeMessage: Joi.boolean().optional(),
  }),
};

staffValidation.updateProfile = {
  body: Joi.object().keys({
    fullname: Joi.string().required(),
    cnic: Joi.string().required().custom(cnic),
    mobile: Joi.string().required().custom(mobile),
    address: Joi.string().required(),
    profileImage: Joi.object(),
  }),
};

module.exports = staffValidation;
