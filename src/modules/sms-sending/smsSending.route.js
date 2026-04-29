const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const smsSendingValidation = require("./smsSending.validation");
const smsSendingController = require("./smsSending.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate(smsSendingValidation.smsSending),
    smsSendingController.smsSending
  )
  .get(
    auth(),
    validate(smsSendingValidation.getSmsSending),
    smsSendingController.getSmsSending
  );

router.get("/sms-balance", auth(), smsSendingController.getSmsBalance);

module.exports = router;
