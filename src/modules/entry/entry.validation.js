const Joi = require("joi");
const { objectId } = require("../../validations/custom.validation");
let entryValidation = {};

entryValidation.createEntry = {
  body: Joi.object().keys({
    entryDate: Joi.date().required(),
    isp: Joi.string().required().custom(objectId),
    userId: Joi.string().required(),
    package: Joi.string().required().custom(objectId),
    paymentMethod: Joi.string().required(),
    tid: Joi.string().allow(""),
    ipType: Joi.string().required(),
    staticIp: Joi.string().allow(""),
    staticIpSaleRate: Joi.number(),
    saleRate: Joi.number().required(),
    startDate: Joi.date().required(),
    expiryDate: Joi.date().required(),
    sendAlertMessage: Joi.boolean().required(),
  }),
};

entryValidation.getAlCompletedlEntries = {
  body: Joi.object().keys({
    startDate: Joi.date().required("Start Date is required"),
    endDate: Joi.date().required("End Date is required").allow(""),
    isp: Joi.string().custom(objectId).required("ISP is required"),
  }),
};

entryValidation.getAlPendingEntries = {
  query: Joi.object().keys({}),
};

entryValidation.getAllPendingEntriesWithinDateRange = {
  body: Joi.object().keys({
    month: Joi.number().required("Month is required"),
    year: Joi.number().required("Year is required"),
  }),
};

entryValidation.getEntryById = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

entryValidation.updateEntry = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    entryDate: Joi.date().required(),
    isp: Joi.string().required().custom(objectId),
    userId: Joi.string().required(),
    package: Joi.string().required().custom(objectId),
    paymentMethod: Joi.string().required(),
    tid: Joi.string().allow(""),
    ipType: Joi.string().required(),
    staticIp: Joi.string().allow(""),
    staticIpSaleRate: Joi.number(),
    saleRate: Joi.number().required(),
    startDate: Joi.date().required(),
    expiryDate: Joi.date().required(),
    sendAlertMessage: Joi.boolean(),
  }),
};

module.exports = entryValidation;
