const { OrganizationModel, StaffModel } = require("../../models");
// const bcrypt = require("bcryptjs");
let organizationService = {};

organizationService.createOrganization = async (orgBody) => {
  const { adminUser, ...organizationData } = orgBody;

  // 1.create Organization
  const organization = await OrganizationModel.create(organizationData);

  // 2. create OrgSuperAdmin user
  // const hashedPassword = await bcrypt.hash(adminUser.password, 8);
  await StaffModel.create({
    fullname: adminUser.name,
    email: adminUser.email,
    password: adminUser.password,
    mobile: adminUser.mobile,
    cnic: adminUser.cnic,
    address: adminUser.address,
    type: adminUser.type,
    share: adminUser.share || 0,
    role: "orgSuperAdmin",
    organizationId: organization._id,
  });

  return organization;
};

organizationService.getAllOrganizations = async () => {
  return await OrganizationModel.find({});
};

organizationService.getOrganizationById = async (id) => {
  return await OrganizationModel.findById(id);
};

// for check email in controller
organizationService.getOrganizationByEmail = async (email) => {
  return await OrganizationModel.findOne({ email });
};

// for check subdomain in conroller
organizationService.getOrganizationBySubdomain = async (subdomain) => {
  return await OrganizationModel.findOne({ subdomain });
};

// for Controller updateOrganization calls
organizationService.updateOrganization = async (id, updateBody) => {
  await OrganizationModel.updateOne({ _id: id }, updateBody);
  return "Organization Updated";
};

// Controller updateStatus calls
organizationService.updateStatus = async (id, status) => {
  await OrganizationModel.updateOne({ _id: id }, { status });
  return "Status Updated";
};

organizationService.updateOrganizationFeatures = async (id, features) => {
  await OrganizationModel.updateOne({ _id: id }, { features });
  return "Features Updated";
};

// Controller deleteOrganization call
organizationService.deleteOrganization = async (id) => {
  await OrganizationModel.deleteOne({ _id: id });
  return "Organization Deleted";
};

module.exports = organizationService;