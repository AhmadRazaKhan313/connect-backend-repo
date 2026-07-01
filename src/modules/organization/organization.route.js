const express = require("express");
const auth = require("../../middlewares/auth");
const organizationController = require("./organization.controller");

const router = express.Router();

// Any authenticated user can read THEIR OWN organization (branding/context).
router.get("/me", auth(), organizationController.getMyOrganization);

// Managing organizations requires the platform-level organization.* permissions.
router.post("/", auth("organization.create"), organizationController.createOrganization);
router.get("/", auth("organization.view"), organizationController.getAllOrganizations);

// Read one org: organization.view (any org) or a user reading their own org.
router.get("/:id", auth(), organizationController.getOrganizationById);

router.put("/:id", auth("organization.edit"), organizationController.updateOrganization);
router.patch("/:id/status", auth("organization.edit"), organizationController.updateStatus);
router.delete("/:id", auth("organization.delete"), organizationController.deleteOrganization);
router.patch("/:id/features", auth("organization.edit"), organizationController.updateFeatures);
router.patch("/:id/logo", auth("organization.edit"), organizationController.uploadLogo);

module.exports = router;
