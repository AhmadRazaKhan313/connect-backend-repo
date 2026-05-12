const httpStatus = require("http-status");
const StaffModel = require("./staff.model");
const ApiError = require("../../utils/ApiError");
const { STAFF_TYPES } = require("../../utils/Constants");

let staffService = {};

staffService.createStaff = async (StaffBody) => {
  const isStaff = await StaffModel.findOne({ email: StaffBody.email });
  if (isStaff && isStaff.mobile === StaffBody.mobile) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Staff already exists with email/mobile"
    );
  } else {
    return await StaffModel.create(StaffBody);
  }
};

staffService.getStaffByEmail = async (email) => {
  return await StaffModel.findOne({ email: email });
};

staffService.getAllStaffs = async (organizationId) => {
  // platformSuperAdmin ko include karo — woh bhi ek staff member hai
  const filter = {};
  if (organizationId) filter.organizationId = organizationId;
  return await StaffModel.find(filter).select('-password');
};

staffService.getStaffsByType = async (type, organizationId) => {
  const filter = { type };
  if (organizationId) filter.organizationId = organizationId;
  return await StaffModel.find(filter);
};

staffService.getStaffById = async (id) => {
  return await StaffModel.findById(id);
};

staffService.getAllPartners = async (organizationId) => {
  const filter = { type: 'partner' };
  if (organizationId) filter.organizationId = organizationId;
  return await StaffModel.find(filter);
};

staffService.updatePassword = async (id, password) => {
  await StaffModel.updateOne({ _id: id }, { password });
  return "Password Updated";
};

staffService.updateProfile = async (id, updateBody) => {
  return await StaffModel.updateOne({ _id: id }, updateBody);
};

// Update staff by id
staffService.updateStaff = async (id, updateBody) => {
  const staff = await StaffModel.findByIdAndUpdate(
    id,
    { $set: updateBody },
    { new: true, runValidators: true }
  );
  if (!staff) throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  return staff;
};

// Delete staff by id
staffService.deleteStaff = async (id) => {
  const staff = await StaffModel.findByIdAndDelete(id);
  if (!staff) throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  return staff;
};

module.exports = staffService;