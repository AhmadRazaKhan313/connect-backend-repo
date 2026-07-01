const { OrganizationModel, StaffModel } = require("../../models");
const RoleModel = require("../role/role.model");
const { ORG_LEVEL_PERMISSIONS } = require("../../config/permissions");

let organizationService = {};

/**
 * Create a new (non-platform) organization, its default "Super Admin" role, and
 * its first user (the owner) assigned to that role.
 *
 * The org's "Super Admin" role gets every ORG-LEVEL permission (full control of
 * the org) but NOT `organization.*`  so the owner runs their own organization
 * yet cannot manage other organizations. The role is a real DB document; nothing
 * is hardcoded.
 */
organizationService.createOrganization = async (orgBody) => {
  const { adminUser, ...organizationData } = orgBody;

  if (!adminUser || !adminUser.email) {
    const err = new Error("Organization owner (adminUser) details are required");
    err.statusCode = 400;
    throw err;
  }

  const existingAdmin = await StaffModel.findOne({ email: adminUser.email });
  if (existingAdmin) {
    const err = new Error(`Owner email '${adminUser.email}' already exists`);
    err.statusCode = 400;
    throw err;
  }

  organizationData.isPlatform = false;
  const organization = await OrganizationModel.create(organizationData);

  let ownerRole;
  try {
    // 1. Default org-admin role (full org access, no organization management).
    ownerRole = await RoleModel.create({
      name: "Super Admin",
      permissions: ORG_LEVEL_PERMISSIONS,
      organizationId: organization._id,
    });

    // 2. The owner, assigned that role.
    await StaffModel.create({
      fullname: adminUser.name,
      email: adminUser.email,
      password: adminUser.password,
      mobile: adminUser.mobile || "00000000000",
      cnic: adminUser.cnic || "0000000000000",
      address: adminUser.address || "N/A",
      roleId: ownerRole._id,
      isPartner: false,
      share: 0,
      organizationId: organization._id,
    });
  } catch (err) {
    // Roll back everything if owner/role creation fails.
    if (ownerRole) await RoleModel.deleteOne({ _id: ownerRole._id });
    await OrganizationModel.deleteOne({ _id: organization._id });
    const e = new Error(err.message || "Failed to create organization owner");
    e.statusCode = 400;
    throw e;
  }

  return organization;
};

organizationService.getAllOrganizations = async () => OrganizationModel.find({});
organizationService.getOrganizationById = async (id) => OrganizationModel.findById(id);
organizationService.getOrganizationByEmail = async (email) => OrganizationModel.findOne({ email });
organizationService.getOrganizationBySubdomain = async (subdomain) => OrganizationModel.findOne({ subdomain });

organizationService.updateOrganization = async (id, updateBody) => {
  const { isPlatform, ...safe } = updateBody; // platform flag can never be changed via update
  await OrganizationModel.updateOne({ _id: id }, safe);
  return OrganizationModel.findById(id);
};

organizationService.updateStatus = async (id, status) => {
  await OrganizationModel.updateOne({ _id: id }, { status });
  return "Status Updated";
};

organizationService.deleteOrganization = async (id) => {
  await OrganizationModel.deleteOne({ _id: id });
  return "Organization Deleted";
};

module.exports = organizationService;
