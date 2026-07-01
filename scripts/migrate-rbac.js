/**
 * RBAC migration  converts existing data from the old multi-role/type model to
 * the new single-SUPER_ADMIN + feature-permissions model. Non-destructive and
 * safe to re-run.
 *
 * What it does:
 *   1. Backfills a unique UUID on every Staff and User missing one.
 *   2. Flags the oldest organization as the Platform Organization (if none flagged).
 *   3. Promotes the legacy platform super admin (old type/role 'platformSuperAdmin')
 *      to role: 'SUPER_ADMIN'. If none exists, promotes the oldest user of the
 *      platform org.
 *   4. Converts every other account to role: null and grants feature permissions:
 *        - old orgSuperAdmin / orgAdmin            -> ALL feature permissions
 *        - old orgStaff / partner (with roleId)    -> permissions copied from the
 *                                                     old Role document
 *        - old type 'partner'                      -> isPartner: true (share kept)
 *   5. Removes obsolete fields (type, roleId) from all accounts.
 *   6. Optionally drops the legacy `roles` collection (set DROP_ROLES=true).
 *   7. Reports any account/user with a missing organizationId (cannot auto-fix).
 *
 * Usage:
 *   npm run migrate:rbac
 *   DROP_ROLES=true npm run migrate:rbac      # also remove the old roles collection
 */
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const crypto = require("crypto");
const mongoose = require("mongoose");
const config = require("../src/config/config");
const { OrganizationModel, StaffModel, UserModel } = require("../src/models");
const { ALL_PERMISSIONS } = require("../src/config/permissions");
const { SYSTEM_ROLES } = require("../src/utils/Constants");

(async () => {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  console.log("Connected to MongoDB\n");

  const db = mongoose.connection.db;
  const staffCol = db.collection("staffs");
  const userCol = db.collection("users");
  const orgCol = db.collection("organizations");
  const roleCol = db.collection("roles");

  try {
    // 1. Backfill UUIDs.
    let staffUuid = 0;
    for (const s of await staffCol.find({ $or: [{ uuid: { $exists: false } }, { uuid: null }] }).toArray()) {
      await staffCol.updateOne({ _id: s._id }, { $set: { uuid: crypto.randomUUID() } });
      staffUuid++;
    }
    let userUuid = 0;
    for (const u of await userCol.find({ $or: [{ uuid: { $exists: false } }, { uuid: null }] }).toArray()) {
      await userCol.updateOne({ _id: u._id }, { $set: { uuid: crypto.randomUUID() } });
      userUuid++;
    }
    console.log(`UUID backfill  staff: ${staffUuid}, users: ${userUuid}`);

    // 2. Flag the platform organization.
    let platformOrg = await orgCol.findOne({ isPlatform: true });
    if (!platformOrg) {
      platformOrg = await orgCol.find({}).sort({ createdAt: 1 }).limit(1).next();
      if (platformOrg) {
        await orgCol.updateOne({ _id: platformOrg._id }, { $set: { isPlatform: true } });
        console.log(`Flagged platform organization: ${platformOrg.name} (${platformOrg._id})`);
      } else {
        console.log("No organizations found  skipping platform flag.");
      }
    } else {
      console.log(`Platform organization already set: ${platformOrg.name}`);
    }

    // 3. Determine the single SUPER_ADMIN.
    let superAdmin = await staffCol.findOne({ role: SYSTEM_ROLES.SUPER_ADMIN });
    if (!superAdmin) {
      superAdmin =
        (await staffCol.findOne({ type: "platformSuperAdmin" })) ||
        (await staffCol.findOne({ role: "platformSuperAdmin" }));
    }
    if (!superAdmin && platformOrg) {
      superAdmin = await staffCol
        .find({ organizationId: platformOrg._id })
        .sort({ createdAt: 1 })
        .limit(1)
        .next();
    }
    if (superAdmin) {
      const set = {
        role: SYSTEM_ROLES.SUPER_ADMIN,
        permissions: ALL_PERMISSIONS,
      };
      if (!superAdmin.organizationId && platformOrg) set.organizationId = platformOrg._id;
      await staffCol.updateOne({ _id: superAdmin._id }, { $set: set, $unset: { type: "", roleId: "" } });
      console.log(`SUPER_ADMIN  ${superAdmin.email}`);
    } else {
      console.log("WARNING: could not determine a SUPER_ADMIN. Run `npm run seed` afterwards.");
    }

    // 4. Convert all other accounts.
    const others = await staffCol
      .find({ _id: superAdmin ? { $ne: superAdmin._id } : { $exists: true } })
      .toArray();

    let converted = 0;
    for (const s of others) {
      const set = { role: null };
      const unset = { type: "", roleId: "" };
      const oldType = s.type || s.role;

      if (oldType === "orgSuperAdmin" || oldType === "orgAdmin") {
        set.permissions = ALL_PERMISSIONS;
      } else if (s.roleId) {
        // Copy permissions from the legacy Role document.
        let rolePerms = [];
        try {
          const roleDoc = await roleCol.findOne({ _id: new mongoose.Types.ObjectId(s.roleId) });
          if (roleDoc && Array.isArray(roleDoc.permissions)) rolePerms = roleDoc.permissions;
        } catch (e) {
          /* ignore malformed roleId */
        }
        set.permissions = Array.isArray(s.permissions) && s.permissions.length ? s.permissions : rolePerms;
      } else if (!Array.isArray(s.permissions)) {
        set.permissions = [];
      }

      if (oldType === "partner" || s.type === "partner") {
        set.isPartner = true;
        set.share = typeof s.share === "number" ? s.share : Number(s.share || 0);
      } else if (s.isPartner === undefined) {
        set.isPartner = false;
        if (s.share === undefined) set.share = 0;
      }

      await staffCol.updateOne({ _id: s._id }, { $set: set, $unset: unset });
      converted++;
    }
    console.log(`Converted ${converted} non-super-admin account(s) to permission-based access.`);

    // 5. Report orphaned accounts (no organization).
    const orphanStaff = await staffCol.countDocuments({ $or: [{ organizationId: { $exists: false } }, { organizationId: null }] });
    const orphanUsers = await userCol.countDocuments({ $or: [{ organizationId: { $exists: false } }, { organizationId: null }] });
    if (orphanStaff || orphanUsers) {
      console.log(`\nWARNING: ${orphanStaff} staff and ${orphanUsers} user(s) have NO organizationId.`);
      console.log("         These must be assigned to an organization manually (organizationId is now required).");
    }

    // 6. Optionally drop the legacy roles collection.
    if (process.env.DROP_ROLES === "true") {
      const exists = await db.listCollections({ name: "roles" }).hasNext();
      if (exists) {
        await roleCol.drop();
        console.log("\nDropped legacy `roles` collection.");
      }
    } else {
      console.log("\n(Legacy `roles` collection left intact. Re-run with DROP_ROLES=true to remove it.)");
    }

    console.log("\nMigration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
})();
