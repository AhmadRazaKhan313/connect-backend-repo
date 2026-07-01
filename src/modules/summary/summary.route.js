const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const summaryValidation = require("./summary.validation");
const summaryController = require("./summary.controller");

const router = express.Router();

// Financial summary  requires dashboard access.
router
  .route("/")
  .post(auth("dashboard.view"), validate(summaryValidation.getSummary), summaryController.getSummary);

// Manual bulk expiry-alert trigger (sends SMS to many subscribers)  requires
// user-management access. The scheduled cron calls the controller directly.
router.get("/send-expiry-alert", auth("user.edit"), summaryController.sendEmailsForTomorrowExpiry);

module.exports = router;
