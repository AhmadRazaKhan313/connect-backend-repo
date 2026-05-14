const { OrganizationModel, StaffModel } = require("../../models");

let organizationService = {};

organizationService.createOrganization = async (orgBody) => {
  const { adminUser, ...organizationData } = orgBody;

  // Admin email pehle check karo — taake org create hone ke baad fail na ho
  const existingAdmin = await StaffModel.findOne({ email: adminUser.email });
  if (existingAdmin) {
    const err = new Error(`Admin email '${adminUser.email}' already exists`);
    err.statusCode = 400;
    throw err;
  }

  // 1. Organization create karo
  const organization = await OrganizationModel.create(organizationData);

  // 2. OrgSuperAdmin create karo — agar fail ho to org rollback
  try {
    await StaffModel.create({
      fullname:       adminUser.name,
      email:          adminUser.email,
      password:       adminUser.password,
      mobile:         adminUser.mobile   || '00000000000',
      cnic:           adminUser.cnic     || '0000000000000',
      address:        adminUser.address  || 'N/A',
      type:           'orgSuperAdmin',
      role:           'orgSuperAdmin',
      share:          adminUser.share    || 0,
      organizationId: organization._id,
    });
  } catch (staffErr) {
    // Staff create fail — org delete karo (rollback)
    await OrganizationModel.deleteOne({ _id: organization._id });
    const err = new Error(staffErr.message || 'Failed to create admin user');
    err.statusCode = 400;
    throw err;
  }

  return organization;
};

organizationService.getAllOrganizations = async () => {
  return await OrganizationModel.find({});
};

organizationService.getOrganizationById = async (id) => {
  return await OrganizationModel.findById(id);
};

organizationService.getOrganizationByEmail = async (email) => {
  return await OrganizationModel.findOne({ email });
};

organizationService.getOrganizationBySubdomain = async (subdomain) => {
  return await OrganizationModel.findOne({ subdomain });
};

organizationService.updateOrganization = async (id, updateBody) => {
  await OrganizationModel.updateOne({ _id: id }, updateBody);
  return OrganizationModel.findById(id);
};

organizationService.updateStatus = async (id, status) => {
  await OrganizationModel.updateOne({ _id: id }, { status });
  return "Status Updated";
};

organizationService.updateOrganizationFeatures = async (id, features) => {
  await OrganizationModel.updateOne({ _id: id }, { features });
  return "Features Updated";
};

organizationService.deleteOrganization = async (id) => {
  await OrganizationModel.deleteOne({ _id: id });
  return "Organization Deleted";
};

module.exports = organizationService;
