const Joi = require("joi");
const { objectId } = require("../../validations/custom.validation");
let packageValidation = {};

packageValidation.createPackage = {
  body: Joi.object().keys({
    isp: Joi.string().required().custom(objectId),
    name: Joi.string().required(),
    bandwidth: Joi.number().required(),
    rateType: Joi.string().required(),
    ratePerDay: Joi.number(),
    purchaseRate: Joi.number().required(),
    saleRate: Joi.number().required(),
    validity: Joi.number().required(),
  }),
};

packageValidation.getAllPackages = {
  query: Joi.object().keys({}),
};

packageValidation.getPackageById = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

packageValidation.getPackageByIsp = {
  params: Joi.object().keys({
    isp: Joi.string().custom(objectId),
  }),
};

packageValidation.updatePackage = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    isp: Joi.string().required().custom(objectId),
    name: Joi.string().required(),
    bandwidth: Joi.number().required(),
    rateType: Joi.string().required(),
    ratePerDay: Joi.number(),
    purchaseRate: Joi.number().required(),
    saleRate: Joi.number().required(),
    validity: Joi.number().required(),
  }),
};
module.exports = packageValidation;
