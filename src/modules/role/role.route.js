const express = require("express");
const auth = require("../../middlewares/auth");
const roleController = require("./role.controller");

const router = express.Router();

// Lightweight list for staff-form dropdowns (any authenticated org user).
router.get("/assignable", auth(), roleController.getCustomRoles);
router.get("/custom-only", auth(), roleController.getCustomRoles);

router
  .route("/")
  .post(auth("role.create"), roleController.createRole)
  .get(auth("role.view"), roleController.getAllRoles);

router
  .route("/:id")
  .get(auth("role.view"), roleController.getRoleById)
  .put(auth("role.edit"), roleController.updateRole)
  .delete(auth("role.delete"), roleController.deleteRole);

module.exports = router;
