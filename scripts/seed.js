/**
 * Seed script  bootstraps the Platform Organization, its "Super Admin" role, and
 * the first admin account assigned to that role. Idempotent.
 *
 * Usage:  npm run seed
 * Env (optional): SEED_ORG_NAME, SEED_ORG_EMAIL, SEED_SUBDOMAIN,
 *                 SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const mongoose = require("mongoose");
const config = require("../src/config/config");
const { OrganizationModel, StaffModel } = require("../src/models");
const RoleModel = require("../src/modules/role/role.model");
const { ALL_PERMISSIONS } = require("../src/config/permissions");

const cfg = {
  orgName: process.env.SEED_ORG_NAME || "Platform HQ",
  orgEmail: process.env.SEED_ORG_EMAIL || "hq@platform.local",
  subdomain: (process.env.SEED_SUBDOMAIN || "hq").toLowerCase(),
  adminName: process.env.SEED_ADMIN_NAME || "Super Admin",
  adminEmail: process.env.SEED_ADMIN_EMAIL || "superadmin@platform.local",
  adminPassword: process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!",
};

(async () => {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  console.log("Connected to MongoDB");

  try {
    // Idempotency: if a platform org with an admin already exists, do nothing.
    let platformOrg = await OrganizationModel.findOne({ isPlatform: true });
    const existingAdmin = platformOrg
      ? await StaffModel.findOne({ organizationId: platformOrg._id })
      : null;
    if (platformOrg && existingAdmin) {
      console.log(`Platform admin already exists (${existingAdmin.email}). Nothing to do.`);
      return;
    }

    if (!platformOrg) {
      platformOrg = await OrganizationModel.create({
        name: cfg.orgName,
        email: cfg.orgEmail,
        subdomain: cfg.subdomain,
        mobile: "00000000000",
        address: "N/A",
        status: "active",
        isPlatform: true,
      });
      console.log(`Created Platform Organization '${platformOrg.name}' (subdomain: ${platformOrg.subdomain}).`);
    }

    // Platform "Super Admin" role  ALL permissions incl organization.*
    let platformRole = await RoleModel.findOne({ organizationId: platformOrg._id, name: "Super Admin" });
    if (!platformRole) {
      platformRole = await RoleModel.create({
        name: "Super Admin",
        permissions: ALL_PERMISSIONS,
        organizationId: platformOrg._id,
      });
      console.log("Created platform 'Super Admin' role (all permissions).");
    }

    await StaffModel.create({
      fullname: cfg.adminName,
      email: cfg.adminEmail,
      password: cfg.adminPassword, // hashed by the model pre-save hook
      roleId: platformRole._id,
      organizationId: platformOrg._id,
      mobile: "00000000000",
      cnic: "0000000000000",
      address: "N/A",
      isPartner: false,
      share: 0,
    });

    console.log("\n Platform admin created:");
    console.log(`   Email:     ${cfg.adminEmail}`);
    console.log(`   Password:  ${cfg.adminPassword}`);
    console.log(`   Role:      Super Admin (all permissions)`);
    console.log(`   Login at:  ${platformOrg.subdomain}.localhost:3000`);
    console.log("\n   Please change this password after first login.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
})();
