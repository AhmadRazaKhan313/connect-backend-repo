const Joi = require("joi");
const { objectId } = require("../../validations/custom.validation");
const { SmsSendingModel } = require("../../models");
const catchAsync = require("../../utils/catchAsync");
let smsSendingController = {};

smsSendingController.smsSending = catchAsync(async (req, res) => {
  const { smsSending } = req?.body;
  const isSmsSending = await SmsSendingModel.find({});
  if (isSmsSending.length === 0) {
    await SmsSendingModel.create({ smsSending });
    res.status(200).send({ message: "Updated" });
  } else {
    const _id = isSmsSending[0]?._id || isSmsSending[0]?.id;
    await SmsSendingModel.updateOne({ _id }, { smsSending });
    res.status(200).send({ message: "Updated" });
  }
});

smsSendingController.getSmsSending = catchAsync(async (req, res) => {
  const isSmsSending = await SmsSendingModel.find({});
  if (isSmsSending.length === 0) {
    await SmsSendingModel.create({ smsSending: true });
    res.status(200).send({ smsSending: true });
  } else {
    const smsSending = isSmsSending[0]?.smsSending;
    res.status(200).send({ smsSending });
  }
});

module.exports = smsSendingController;
