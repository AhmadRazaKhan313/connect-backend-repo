const Joi = require("joi");
const { objectId } = require("../../validations/custom.validation");
let ispValidation = {};

ispValidation.smsSending = {
  body: Joi.object().keys({
    smsSending: Joi.boolean().required("smsSending is requried"),
  }),
};

ispValidation.getSmsSending = {
  query: Joi.object().keys({}),
};

module.exports = ispValidation;
