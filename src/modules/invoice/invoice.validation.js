const Joi = require("joi");
const { objectId } = require("../../validations/custom.validation");
let invoiceValidation = {};

invoiceValidation.createInvoice = {
  body: Joi.object().keys({
    isp: Joi.string().required().custom(objectId),
    date: Joi.date().required(),
    paymentMethod: Joi.string().required(),
    tid: Joi.string().allow(''),
    amount: Joi.number().required(),
    comments: Joi.string().allow(''),
  }),
};

invoiceValidation.getAllInvoices = {
  body: Joi.object().keys({
    startDate: Joi.date().required("Start Date is required"),
    endDate: Joi.date().required("End Date is required").allow(""),
    isp: Joi.string().custom(objectId).required("ISP is required"),
  }),
};

invoiceValidation.getInvoiceById = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

invoiceValidation.updateInvoice = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    isp: Joi.string().required().custom(objectId),
    date: Joi.date().required(),
    paymentMethod: Joi.string().required(),
    tid: Joi.string().allow(''),
    amount: Joi.number().required(),
    comments: Joi.string().allow(''),
  }),
};

module.exports = invoiceValidation;
