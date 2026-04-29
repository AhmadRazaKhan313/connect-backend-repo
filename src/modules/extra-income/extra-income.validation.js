const Joi = require("joi");
const { objectId } = require("../../validations/custom.validation");
let extraIncomeValidation = {};

extraIncomeValidation.createExtraIncome = {
  body: Joi.object().keys({
    date: Joi.date().required(),
    category: Joi.string().required(),
    userId: Joi.string().allow(""),
    amount: Joi.number().allow(""),
    paymentMethod: Joi.string().required(),
    tid: Joi.string().allow(""),
    details: Joi.string().required(),
  }),
};

extraIncomeValidation.getAllCompletedExtraIncomes = {
  body: Joi.object().keys({
    startDate: Joi.date().required("Start Date is required"),
    endDate: Joi.date().required("End Date is required"),
  }),
};

extraIncomeValidation.getAllExtraIncomes = {
  query: Joi.object().keys({}),
};

extraIncomeValidation.getExtraIncomeById = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

extraIncomeValidation.updateExtraIncome = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    date: Joi.date().required(),
    category: Joi.string().required(),
    userId: Joi.string().allow(""),
    amount: Joi.number().allow(""),
    paymentMethod: Joi.string().required(),
    tid: Joi.string().allow(""),
    details: Joi.string().required(),
  }),
};

module.exports = extraIncomeValidation;
