const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const summaryValidation = require("./summary.validation");
const summaryController = require("./summary.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate(summaryValidation.getSummary),
    summaryController.getSummary
  );

router.get("/send-expiry-alert", summaryController.sendEmailsForTomorrowExpiry);

module.exports = router;
