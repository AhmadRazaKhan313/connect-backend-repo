const { SmsSendingModel } = require("../../models");
const { getSmsBalance } = require("../../services/email.service");
const catchAsync = require("../../utils/catchAsync");
let smsSendingController = {};

smsSendingController.smsSending = catchAsync(async (req, res) => {
  const { smsSending } = req?.body;
  const organizationId = req.organizationId;

// find own organization setting
  const filter = organizationId ? { organizationId } : {};
  const isSmsSending = await SmsSendingModel.find(filter);

  if (isSmsSending.length === 0) {
    // New setting with organizationId
    await SmsSendingModel.create({ smsSending, organizationId });
    res.status(200).send({ message: "Updated" });
  } else {
    const _id = isSmsSending[0]?._id || isSmsSending[0]?.id;
    await SmsSendingModel.updateOne({ _id }, { smsSending });
    res.status(200).send({ message: "Updated" });
  }
});

smsSendingController.getSmsSending = catchAsync(async (req, res) => {
  const organizationId = req.organizationId;

  const filter = organizationId ? { organizationId } : {};
  const isSmsSending = await SmsSendingModel.find(filter);

  if (isSmsSending.length === 0) {
    await SmsSendingModel.create({ smsSending: true, organizationId });
    res.status(200).send({ smsSending: true });
  } else {
    const smsSending = isSmsSending[0]?.smsSending;
    res.status(200).send({ smsSending });
  }
});

smsSendingController.getSmsBalance = catchAsync(async (req, res) => {
  const smsBalance = await getSmsBalance();
  res.status(200).send({ smsBalance });
});

module.exports = smsSendingController;