const Joi = require("joi");
const { STAFF_TYPES } = require("../../utils/Constants");
const { objectId, cnic, mobile } = require("../../validations/custom.validation");

let staffValidation = {};

staffValidation.createStaff = {
  body: Joi.object().keys({
    fullname: Joi.string().required().messages({ 'any.required': 'Full Name is required' }),
    email: Joi.string().required().email().messages({ 'any.required': 'Email is required' }),
    password: Joi.string().required().messages({ 'any.required': 'Password is required' }),
    cnic: Joi.string().required().custom(cnic).messages({ 'any.required': 'CNIC is required' }),
    mobile: Joi.string().required().custom(mobile).messages({ 'any.required': 'Mobile is required' }),
    address: Joi.string().required().messages({ 'any.required': 'Address is required' }),
    type: Joi.string()
      .valid(...Object.values(STAFF_TYPES))
      .required()
      .messages({ 'any.required': 'Staff Type is required', 'any.only': 'Invalid staff type' }),
    share: Joi.number().when('type', {
      is: STAFF_TYPES.partner,
      then: Joi.number().required().messages({ 'any.required': 'Share is required for Partner' }),
      otherwise: Joi.number().default(0),
    }),
    sendWelcomeMessage: Joi.boolean().required(),

    // roleId: orgStaff aur partner ke liye REQUIRED, baaki ke liye optional
    roleId: Joi.string().custom(objectId).when('type', {
      is: Joi.valid('orgStaff', 'partner'),
      then: Joi.string().required().messages({ 'any.required': 'Role assign karna zaroori hai' }),
      otherwise: Joi.string().optional().allow('', null),
    }),
  }),
};

staffValidation.getStaffById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
};

staffValidation.getAllStaff = {
  query: Joi.object().keys({}),
};

staffValidation.updateStaff = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    fullname: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional().allow(''),
    cnic: Joi.string().custom(cnic).optional(),
    mobile: Joi.string().custom(mobile).optional(),
    address: Joi.string().optional(),
    type: Joi.string().valid(...Object.values(STAFF_TYPES)).optional(),
    share: Joi.number().optional(),
    roleId: Joi.string().custom(objectId).optional().allow('', null),
    role: Joi.string().optional().allow('', null),
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