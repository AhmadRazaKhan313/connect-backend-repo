const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { staffService } = require("../../services");
const { STAFF_TYPES } = require("../../utils/Constants");
const { sendSms } = require("../../services/email.service");
const { s3 } = require("../../services/s3Service");

let staffController = {};

staffController.createStaff = catchAsync(async (req, res) => {
  const { organizationId } = req;
  const body = req.body;

  // Har type ke liye role auto-assign karo — koi bhi bina role ke nahi banega
  const TYPE_TO_ROLE = {
    [STAFF_TYPES.platformSuperAdmin]: STAFF_TYPES.platformSuperAdmin,
    [STAFF_TYPES.orgSuperAdmin]:      STAFF_TYPES.orgSuperAdmin,
    [STAFF_TYPES.orgAdmin]:           STAFF_TYPES.orgAdmin,
    [STAFF_TYPES.orgStaff]:           STAFF_TYPES.orgStaff,
  };

  if (!TYPE_TO_ROLE[body.type]) {
    // partner / legacy types ke liye role null rehta hai (financial only)
    body.role = null;
  } else {
    body.role = TYPE_TO_ROLE[body.type];
  }

  // orgStaff aur partner dono ke liye roleId LAZMI hai
  if (
    (body.type === STAFF_TYPES.orgStaff || body.type === STAFF_TYPES.partner) &&
    !body.roleId
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${body.type} ke liye custom role assign karna zaroori hai`);
  }

  const partners = await staffService.getAllPartners(organizationId);

  if (body.type === STAFF_TYPES.partner) {
    const allPartnersShare = partners.reduce((acc, p) => (acc += +p?.share), 0);
    if (allPartnersShare + body?.share > 100) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Max share limit remaining is ${100 - allPartnersShare}`
      );
    }
  }

  const staff = await staffService.createStaff({ ...body, organizationId });
  sendSmsAndEmail(staff, body);
  res.status(httpStatus.CREATED).send(staff);
});

staffController.updateStaff = catchAsync(async (req, res) => {
  const staff = await staffService.getStaffById(req.params.id);
  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  }

  const isSelf = req.user?._id?.toString() === req.params.id ||
                 req.user?.id?.toString() === req.params.id;

  // Apna role aur type khud nahi badal sakta
  if (isSelf) {
    delete req.body.role;
    delete req.body.roleId;
    delete req.body.type;
  }

  // System role ID assign nahi ho sakta (system-... format invalid ObjectId hai)
  if (req.body.roleId && typeof req.body.roleId === 'string' && req.body.roleId.startsWith('system-')) {
    throw new ApiError(httpStatus.BAD_REQUEST, "System roles cannot be assigned as roleId");
  }

  // platformSuperAdmin ka role koi nahi badal sakta
  if (
    staff.type === 'platformSuperAdmin' ||
    staff.role === 'platformSuperAdmin'
  ) {
    // Sirf apna profile update kar sakta hai (name, email, password etc.)
    // Role/type protect karo
    delete req.body.role;
    delete req.body.roleId;
    delete req.body.type;
  }

  // Bug fix: password is NEVER updated through this endpoint
  // Password change has a dedicated endpoint — accidental overwrite rokne ke liye
  delete req.body.password;

  // _id, __v, createdAt, updatedAt — immutable fields bhi hatao
  delete req.body._id;
  delete req.body.__v;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  const updated = await staffService.updateStaff(req.params.id, req.body);
  res.send(updated);
});

staffController.deleteStaff = catchAsync(async (req, res) => {
  const staff = await staffService.getStaffById(req.params.id);
  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  }
  // Apna account delete na kar sake
  if (
    req.user?._id?.toString() === req.params.id ||
    req.user?.id?.toString() === req.params.id
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot delete your own account");
  }
  // platformSuperAdmin delete nahi ho sakta
  if (staff.type === 'platformSuperAdmin' || staff.role === 'platformSuperAdmin') {
    throw new ApiError(httpStatus.FORBIDDEN, "Platform Super Admin cannot be deleted");
  }
  await staffService.deleteStaff(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

async function sendSmsAndEmail(staff, body) {
  const message = `Dear ${staff?.fullname}, You have been registered as a staff to Connect Communications Lodhran Family. Your new password is '${body?.password}'`;
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
  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  }
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
    staff.password = null;
    res.send(staff);
  } else {
    throw new ApiError(httpStatus[404], "Something went wrong");
  }
});

module.exports = staffController;