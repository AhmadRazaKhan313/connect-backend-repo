const Joi = require("joi");
let summaryValidation = {};

summaryValidation.getSummary = {
  body: Joi.object().keys({
    month: Joi.number().required("Month is required"),
    year: Joi.number().required("Year is required"),
  }),
};

module.exports = summaryValidation;
