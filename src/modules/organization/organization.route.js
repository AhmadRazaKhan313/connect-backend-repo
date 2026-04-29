const express = require("express");
const auth = require("../../middlewares/auth");
const organizationController = require("./organization.controller");

const router = express.Router();

// Create organization - only superadmin
router.post("/", auth(), organizationController.createOrganization);

// Get all organizations - only superadmin
router.get("/", auth(), organizationController.getAllOrganizations);

// Get organization by id
router.get("/:id", auth(), organizationController.getOrganizationById);

// Update organization
router.put("/:id", auth(), organizationController.updateOrganization);

// Update status (active/inactive)
router.patch("/:id/status", auth(), organizationController.updateStatus);

// Delete organization
router.delete("/:id", auth(), organizationController.deleteOrganization);

// features update in Organization
router.patch("/:id/features", auth(), organizationController.updateFeatures);

module.exports = router;