const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const authValidation = require("./auth.validation");
const authController = require("./auth.controller");
const setupRouter = require("./setup.route");

const router = express.Router();

// One-time super admin setup
router.use(setupRouter);

router.post("/login", validate(authValidation.login), authController.login);

router.post("/refreshToken", authController.refreshToken);

router.post("/logout", authController.logout);

router.post(
  "/reset-password",
  validate(authValidation.resetPassword),
  authController.resetPassword
);

router.post(
  "/update-password",
  auth(),
  validate(authValidation.updatePassword),
  authController.updatePassword
);

module.exports = router;
