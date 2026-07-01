const httpStatus = require("http-status");
const StaffModel = require("./staff.model");
const ApiError = require("../../utils/ApiError");
const roleService = require("../role/role.service");

let staffService = {};

staffService.createStaff = async (StaffBody) => {
  const isStaff = await StaffModel.findOne({ email: StaffBody.email });
  if (isStaff && isStaff.mobile === StaffBody.mobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Staff already exists with email/mobile");
  }
  return StaffModel.create(StaffBody);
};

staffService.getStaffByEmail = async (email) => StaffModel.findOne({ email });

staffService.getAllStaffs = async (organizationId) => {
  const filter = {};
  if (organizationId) filter.organizationId = organizationId;
  // Populate the role so the UI can show each account's role name + permissions.
  return StaffModel.find(filter).select("-password").populate("roleId", "name permissions");
};

staffService.getStaffById = async (id) => StaffModel.findById(id);

/**
 * Accounts within an org whose ROLE includes a given permission.
 * Used to find who can perform a permission-gated action.
 */
staffService.getStaffsByPermission = async (permission, organizationId) => {
  const roleIds = await roleService.getRoleIdsWithPermission(permission, organizationId);
  if (!roleIds.length) return [];
  const filter = { roleId: { $in: roleIds } };
  if (organizationId) filter.organizationId = organizationId;
  return StaffModel.find(filter).select("-password");
};

staffService.getAllPartners = async (organizationId) => {
  const filter = { isPartner: true };
  if (organizationId) filter.organizationId = organizationId;
  return StaffModel.find(filter).select("-password");
};

staffService.updatePassword = async (id, hashedPassword) => {
  await StaffModel.updateOne({ _id: id }, { password: hashedPassword });
  return "Password Updated";
};

staffService.updateProfile = async (id, updateBody) => {
  return StaffModel.updateOne({ _id: id }, updateBody);
};

staffService.updateStaff = async (id, updateBody) => {
  const staff = await StaffModel.findByIdAndUpdate(id, { $set: updateBody }, { new: true, runValidators: true });
  if (!staff) throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  return staff;
};

staffService.deleteStaff = async (id) => {
  const staff = await StaffModel.findByIdAndDelete(id);
  if (!staff) throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  return staff;
};

module.exports = staffService;
