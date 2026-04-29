const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { ispService, entryService, userService } = require("../../services");
const { sendSms, sendEmailByInfo } = require("../../services/email.service");
const { getEmailFormat } = require("../../utils/helpers");
let ispController = {};

ispController.createIsp = catchAsync(async (req, res) => {
  const isIspAlreadyRegistered = await ispService.getIspByVlan(req.body.vlan);
  if (isIspAlreadyRegistered)
    throw new ApiError(httpStatus.NOT_FOUND, "VLAN Already Assigned");
  else {
    req.body.organizationId = req.organizationId;
    const isp = await ispService.createIsp(req.body);
    res.status(httpStatus.CREATED).send(isp);
  }
});

ispController.getAllisps = catchAsync(async (req, res) => {
  const isps = await ispService.getAllIsps(req.organizationId);
  if (!isps || isps.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No isps");
  }
  res.send(isps);
});

ispController.getIspById = catchAsync(async (req, res) => {
  const isp = await ispService.getIspById(req?.params?.id);
  if (!isp) {
    throw new ApiError(httpStatus.NOT_FOUND, "Isp Not Found");
  }
  res.send(isp);
});

ispController.updateIspById = catchAsync(async (req, res) => {
  const isp = await ispService.getIspById(req?.params?.id);
  if (!isp) throw new ApiError(httpStatus.NOT_FOUND, "Isp Not Found");
  else {
    const isIspAlreadyRegistered = await ispService.getIspByVlan(req.body.vlan);
    if (isIspAlreadyRegistered && isp.id !== isIspAlreadyRegistered.id)
      throw new ApiError(httpStatus.NOT_FOUND, "VLAN Already Assigned");
    const isps = await ispService.updateIspById(req?.params?.id, req?.body);
    res.send(isps);
  }
});

ispController.deleteIspById = catchAsync(async (req, res) => {
  const isp = await ispService.getIspById(req?.params?.is);
  if (!isp) throw new ApiError(httpStatus.NOT_FOUND, "Isp Not Found");
  else {
    const isps = await ispService.deleteIspById(req?.params?.id);
    res.send(isps);
  }
});

ispController.sendServerDownAlert = catchAsync(async (req, res) => {
  const { id } = req?.params;
  const entries = await entryService.getEntriesByISPWithValidExpiry(id);
  const users = await Promise.all(
    entries.map(async (entry) => {
      return await userService.getUserByUserId(entry?.userId);
    })
  );

  users.forEach(async (user) => {
    const message = `Dear ${user?.fullname}, Internet server is down and will be up soon, ETTR will be share ASAP. Thankyou for your cooperation`;
    await sendSms(user?.mobile, message);
  });
  res.send("Server Down");
});

ispController.sendServerUpAlert = catchAsync(async (req, res) => {
  const { id } = req?.params;
  const entries = await entryService.getEntriesByISPWithValidExpiry(id);
  const users = await Promise.all(
    entries.map(async (entry) => {
      return await userService.getUserByUserId(entry?.userId);
    })
  );

  users.forEach(async (user) => {
    const message = `Dear ${user?.fullname}, Internet service has been restored, please check carefully. Thankyou for your cooperation`;
    await sendSms(user?.mobile, message);
  });
  res.send("Server Up");
});

module.exports = ispController;