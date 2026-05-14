const express = require("express");
const auth = require("../../middlewares/auth");
const organizationController = require("./organization.controller");

const router = express.Router();

router.post("/", auth(), organizationController.createOrganization);
router.get("/", auth(), organizationController.getAllOrganizations);
router.get("/:id", auth(), organizationController.getOrganizationById);
router.put("/:id", auth(), organizationController.updateOrganization);
router.patch("/:id/status", auth(), organizationController.updateStatus);
router.delete("/:id", auth(), organizationController.deleteOrganization);
router.patch("/:id/features", auth(), organizationController.updateFeatures);

// Bug fix: multer remove — base64 JSON body accept karta hai
router.patch("/:id/logo", auth(), organizationController.uploadLogo);

module.exports = router;
