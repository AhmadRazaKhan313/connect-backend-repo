const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const authValidation = require("./auth.validation");
const authController = require("./auth.controller");
const setupRouter = require("./setup.route");
const StaffModel = require("../staff/staff.model");
const bcrypt = require("bcryptjs");

const router = express.Router();

// One-time super admin setup
router.use(setupRouter);

// TEMP DEBUG — email se user check karo (PRODUCTION SE HATAO)
router.post("/debug-user", async (req, res) => {
  const { email, password } = req.body;
  const staff = await StaffModel.findOne({ email });
  if (!staff) return res.send({ found: false, message: "Email DB mein nahi hai" });
  const isMatch = await bcrypt.compare(password, staff.password);
  res.send({
    found: true,
    email: staff.email,
    type: staff.type,
    role: staff.role,
    organizationId: staff.organizationId,
    passwordMatch: isMatch,
    passwordHashStored: staff.password?.substring(0, 10) + "...",
  });
});

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