const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const smsSendingValidation = require("./smsSending.validation");
const smsSendingController = require("./smsSending.controller");

const router = express.Router();

router
  .route("/")
  // Sending bulk SMS costs money  require user-management access.
  .post(
    auth("user.view"),
    validate(smsSendingValidation.smsSending),
    smsSendingController.smsSending
  )
  .get(
    auth("user.view"),
    validate(smsSendingValidation.getSmsSending),
    smsSendingController.getSmsSending
  );

// Balance is low-sensitivity and shown in the header for every signed-in account.
router.get("/sms-balance", auth(), smsSendingController.getSmsBalance);

module.exports = router;
