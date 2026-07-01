const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const authValidation = require("./auth.validation");
const authController = require("./auth.controller");
const setupRouter = require("./setup.route");

const router = express.Router();

// One-time platform setup (creates the platform org + first admin).
router.use(setupRouter);

router.post("/login", validate(authValidation.login), authController.login);

// GET /auth/me  fresh account + permissions (client calls this on route changes).
router.get("/me", auth(), authController.getMe);

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
