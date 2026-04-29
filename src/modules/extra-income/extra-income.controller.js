const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { extraIncomeService, userService } = require("../../services");
let entryController = {};

entryController.createExtraIncome = catchAsync(async (req, res) => {
  if (req?.body?.date.toISOString().includes("T19")) {
    req.body.date.setUTCDate(req.body.date.getUTCDate() + 1);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  req.body.organizationId = req.organizationId;
  const extraIncome = await extraIncomeService.createExtraIncome(req.body);
  res.status(httpStatus.CREATED).send(extraIncome);
});

entryController.getAllCompletedExtraIncomes = catchAsync(async (req, res) => {
  const allExtraIncomes = await extraIncomeService.getAllCompletedExtraIncomes(
    req?.body?.startDate,
    req?.body?.endDate,
    req.organizationId
  );
  if (!allExtraIncomes || allExtraIncomes.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Completed Extra Incomes");
  }
  const extraIncomes = await Promise.all(
    allExtraIncomes.map(async (item) => {
      const user = await userService.getUserByUserId(item?.userId);
      return {
        ...item?._doc,
        user,
      };
    })
  );
  res.send({
    extraIncomes,
    total: extraIncomes.reduce((acc, item) => (acc += +item?.amount), 0),
  });
});

entryController.getAllPendingExtraIncomes = catchAsync(async (req, res) => {
  const allExtraIncomes = await extraIncomeService.getAllPendingExtraIncomes(
    req?.body?.startDate,
    req?.body?.endDate,
    req.organizationId
  );
  if (!allExtraIncomes || allExtraIncomes.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Pending Extra Incomes");
  }
  const extraIncomes = await Promise.all(
    allExtraIncomes.map(async (item) => {
      const user = await userService.getUserByUserId(item?.userId);
      return {
        ...item?._doc,
        user,
      };
    })
  );
  res.send({
    extraIncomes,
    total: extraIncomes.reduce((acc, item) => (acc += +item?.amount), 0),
  });
});

entryController.getExtraIncomeById = catchAsync(async (req, res) => {
  const extraIncome = await extraIncomeService.getExtraIncomeById(
    req.params.id
  );
  if (!extraIncome) {
    throw new ApiError(httpStatus.NOT_FOUND, "Extra Income not found");
  }
  res.send(extraIncome);
});

entryController.updateExtraIncomeById = catchAsync(async (req, res) => {
  if (req?.body?.date.toISOString().includes("T19")) {
    req.body.date.setUTCDate(req.body.date.getUTCDate() + 1);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  const extraIncome = await extraIncomeService.getExtraIncomeById(
    req?.params?.id
  );
  if (!extraIncome)
    throw new ApiError(httpStatus.NOT_FOUND, "Extra Income Not Found");
  else {
    const ExtraIncome = await extraIncomeService.updateExtraIncomeById(
      req?.params?.id,
      req?.body
    );
    res.send(ExtraIncome);
  }
});

entryController.deleteExtraIncomeById = catchAsync(async (req, res) => {
  const extraIncome = await extraIncomeService.getExtraIncomeById(
    req?.params?.id
  );
  if (!extraIncome)
    throw new ApiError(httpStatus.NOT_FOUND, "Extra Income Not Found");
  else {
    const ExtraIncome = await extraIncomeService.deleteExtraIncome(
      req?.params?.id
    );
    res.send(ExtraIncome);
  }
});

module.exports = entryController;