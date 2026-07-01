const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { staffService } = require("../../services");
const { sendSms } = require("../../services/email.service");
const { s3 } = require("../../services/s3Service");
const { assertSameOrg } = require("../../utils/tenant");
const RoleModel = require("../role/role.model");

let staffController = {};

// Validate that a roleId exists and belongs to the requester's organization.
const resolveRole = async (roleId, req) => {
  if (!roleId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "A role is required for every account");
  }
  const role = await RoleModel.findById(roleId);
  if (!role || role.organizationId.toString() !== req.organizationId.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role for this organization");
  }
  return role;
};

staffController.createStaff = catchAsync(async (req, res) => {
  const body = { ...req.body };
  await resolveRole(body.roleId, req); // every account MUST have a valid org role

  body.isPartner = body.isPartner === true;
  body.share = body.isPartner ? Number(body.share || 0) : 0;

  if (body.isPartner) {
    const partners = await staffService.getAllPartners(req.organizationId);
    const usedShare = partners.reduce((acc, p) => acc + (+p?.share || 0), 0);
    if (usedShare + body.share > 100) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, `Max share limit remaining is ${100 - usedShare}`);
    }
  }

  const staff = await staffService.createStaff({
    fullname: body.fullname,
    email: body.email,
    password: body.password,
    cnic: body.cnic,
    mobile: body.mobile,
    address: body.address,
    roleId: body.roleId,
    isPartner: body.isPartner,
    share: body.share,
    organizationId: req.organizationId, // always the requester's org  no cross-org creation
    createdBy: req.user?._id || req.user?.id,
  });

  sendSmsAndEmail(staff, req.body);
  staff.password = undefined;
  res.status(httpStatus.CREATED).send(staff);
});

staffController.updateStaff = catchAsync(async (req, res) => {
  const staff = await staffService.getStaffById(req.params.id);
  assertSameOrg(staff, req, "Staff");

  const body = { ...req.body };
  const requesterId = (req.user?._id || req.user?.id)?.toString();
  const isSelf = requesterId === req.params.id;

  // Immutable / protected.
  delete body._id;
  delete body.uuid;
  delete body.__v;
  delete body.createdAt;
  delete body.updatedAt;
  delete body.createdBy;
  delete body.password;       // dedicated password endpoint
  delete body.organizationId; // accounts cannot move organizations

  // A user cannot change their own role or partner status (no self-escalation).
  if (isSelf) {
    delete body.roleId;
    delete body.isPartner;
    delete body.share;
  }

  if (body.roleId !== undefined) {
    await resolveRole(body.roleId, req);
  }
  if (body.isPartner !== undefined) {
    body.isPartner = body.isPartner === true;
    body.share = body.isPartner ? Number(body.share || 0) : 0;
  }

  body.updatedBy = req.user?._id || req.user?.id;
  const updated = await staffService.updateStaff(req.params.id, body);
  updated.password = undefined;
  res.send(updated);
});

staffController.deleteStaff = catchAsync(async (req, res) => {
  const staff = await staffService.getStaffById(req.params.id);
  assertSameOrg(staff, req, "Staff");

  const requesterId = (req.user?._id || req.user?.id)?.toString();
  if (requesterId === req.params.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot delete your own account");
  }

  await staffService.deleteStaff(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

async function sendSmsAndEmail(staff, body) {
  const message = `Dear ${staff?.fullname}, You have been registered as a staff member. Your new password is '${body?.password}'`;
  if (body?.sendWelcomeMessage && body?.mobile && body?.mobile !== "") {
    await sendSms(body?.mobile, message);
  }
}

staffController.getAllStaffs = catchAsync(async (req, res) => {
  const staffs = await staffService.getAllStaffs(req.organizationId);
  if (!staffs || staffs.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Staffs");
  }
  res.send(staffs);
});

staffController.getStaff = catchAsync(async (req, res) => {
  const staff = await staffService.getStaffById(req.params.id);
  assertSameOrg(staff, req, "Staff");
  staff.password = undefined;
  res.send(staff);
});

staffController.getAllPartners = catchAsync(async (req, res) => {
  const partners = await staffService.getAllPartners(req.organizationId);
  if (!partners || partners.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No partners found");
  }
  res.send(partners);
});

staffController.updateProfile = catchAsync(async (req, res) => {
  let updateBody = req?.body;
  const user = req?.user;
  const file = req?.file;
  if (file) {
    const key = `${user?.id || user?._id}`;
    const params = {
      Bucket: `${process.env.AWS_BUCKET_NAME}/staff-images`,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    try {
      const response = await s3.upload(params).promise();
      updateBody.profileImage = response.Location;
    } catch (error) {
      console.error("S3 upload failed:", error);
    }
  }
  const update = await staffService.updateProfile(user?.id, updateBody);
  if (update) {
    let staff = await staffService.getStaffById(user?.id);
    staff.password = undefined;
    res.send(staff);
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong");
  }
});

module.exports = staffController;
