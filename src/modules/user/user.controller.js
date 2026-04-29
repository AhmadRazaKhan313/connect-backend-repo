const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { userService } = require("../../services");
const { sendSms, sendTemplateForWelcome } = require("../../services/email.service");

let userController = {};

userController.createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser({ ...req.body, organizationId: req.organizationId });
  if (user) {
    if (
      req?.body?.sendWelcomeMessage &&
      req?.body?.mobile &&
      req?.body?.mobile !== ""
    ) {
      await sendTemplateForWelcome(req?.body?.mobile, user?.fullname, user?.userId);
    }
    res.status(httpStatus.CREATED).send(user);
  }
});

userController.getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers(req.organizationId);
  if (!users || users.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Users");
  }
  res.send(users);
});

userController.getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

userController.updateUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req?.params?.id);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  else {
    const User = await userService.updateUserById(req?.params?.id, req?.body);
    const newUser = await userService.getUserById(req?.params?.id);
    if (newUser) {
      if (
        req?.body?.sendWelcomeMessage &&
        newUser?.mobile &&
        newUser?.mobile !== ""
      ) {
        await sendTemplateForWelcome(req?.body?.mobile, user?.fullname, user?.userId);
      }
    }
    res.send(User);
  }
});

userController.deleteUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req?.params?.id);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  else {
    const User = await userService.deleteUserById(req?.params?.id);
    res.send(User);
  }
});

userController.sendCustomMessage = catchAsync(async (req, res) => {
  const { message } = req?.body;
  const users = await userService.getAllUsers(req.organizationId);
  if (!users) throw new ApiError(httpStatus.NOT_FOUND, "No Users Found");
  else {
    users.forEach((user) => {
      sendSms(user?.mobile, message);
    });
    res.send("Message Sent");
  }
});

userController.getAutoCompleteUsers = catchAsync(async (req, res) => {
  const { userId } = req?.body;
  const users = await userService.getAutoCompletedUsers(userId, req.organizationId);
  res.send(users);
});

module.exports = userController;