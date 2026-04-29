const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const {
  entryService,
  userService,
  packageService,
  ispService,
} = require("../../services");
const { sendTemplateForEntryPayment } = require("../../services/email.service");
const {
  getDaysBetweenDates,
  getFirstAndLastDate,
} = require("../../utils/helpers");
const moment = require("moment");
const { getPaymentMethodNameByKey } = require("../../utils/helpers");

let entryController = {};

entryController.createEntry = catchAsync(async (req, res) => {
  if (req?.body?.entryDate.toISOString().includes("T19")) {
    req.body.entryDate.setUTCDate(req.body.entryDate.getUTCDate() + 1);
    req.body.entryDate.setUTCHours(0, 0, 0, 0);
  }
  if (req?.body?.startDate.toISOString().includes("T19")) {
    req.body.startDate.setUTCDate(req.body.startDate.getUTCDate() + 1);
    req.body.startDate.setUTCHours(0, 0, 0, 0);
  }
  if (req?.body?.expiryDate.toISOString().includes("T19")) {
    req.body.expiryDate.setUTCDate(req.body.expiryDate.getUTCDate() + 1);
    req.body.expiryDate.setUTCHours(0, 0, 0, 0);
  }
  const isUser = await userService.getUserByUserId(req.body.userId);
  if (!isUser) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  else {
    const Package = await packageService.getPackageById(req?.body?.package);
    if (Package?.rateType === "day") {
      const days = getDaysBetweenDates(
        req?.body?.startDate,
        req?.body?.expiryDate
      );
      const purchaseRate = Math.ceil((Package?.purchaseRate / 31) * days);
      req.body.purchaseRateOriginal = purchaseRate;
      req.body.purchaseRate = purchaseRate;
    } else {
      req.body.purchaseRateOriginal = Package?.purchaseRate;
      req.body.purchaseRate = Package?.purchaseRate;
    }
    req.body.saleRateOriginal = +req?.body?.saleRate;

    if (req?.body?.ipType === "static") {
      const Isp = await ispService.getIspById(req.body?.isp);
      req.body.saleRate = +req?.body?.saleRate + +req?.body?.staticIpSaleRate;
      req.body.purchaseRate = +req?.body?.purchaseRate + +Isp?.staticIpRate;
    }

    const entry = await entryService.createEntry({ ...req.body, organizationId: req.organizationId });
    await ispService.updateIspById(Package?.isp?.id, {
      openingBalance: Package?.isp?.openingBalance - Package?.purchaseRate,
    });
    const expiryDate = moment(new Date(req?.body?.expiryDate)).format(
      "DD MMM, YYYY"
    );
    let paymentMethod = getPaymentMethodNameByKey(req?.body?.paymentMethod);
    paymentMethod = paymentMethod === "NET" ? "Cash" : paymentMethod;
    const tid = req?.body?.tid === "" ? `Payment Method: ${paymentMethod}` : `TID ${req?.body?.tid}, Payment Method: ${paymentMethod}`;
    if (
      isUser?.mobile &&
      req?.body?.sendAlertMessage &&
      req?.body?.paymentMethod !== "pending"
    ) {
      await sendTemplateForEntryPayment(isUser?.mobile, isUser?.fullname, isUser?.userId, Package?.isp?.vlan, tid, expiryDate);
    }
    res.status(httpStatus.CREATED).send(entry);
  }
});

entryController.getAlCompletedlEntries = catchAsync(async (req, res) => {
  const allEntries = await entryService.getAlCompletedlEntries(
    req?.body?.startDate,
    req?.body?.endDate,
    req?.body?.isp,
    req.organizationId
  );
  if (!allEntries || allEntries.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Completed Entries");
  }
  const entries = await Promise.all(
    allEntries.map(async (item) => {
      const user = await userService.getUserByUserId(item?.userId);
      return {
        ...item?._doc,
        user,
      };
    })
  );
  res.send({
    entries,
    total: entries.reduce((acc, item) => (acc += +item?.saleRate), 0),
  });
});

entryController.getAlPendinglEntries = catchAsync(async (req, res) => {
  const allEntries = await entryService.getAlPendinglEntries(req.organizationId);
  if (!allEntries || allEntries.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Pending Entries");
  }

  const entries = await Promise.all(
    allEntries.map(async (item) => {
      const user = await userService.getUserByUserId(item?.userId);
      return {
        ...item?._doc,
        user,
      };
    })
  );
  res.send(entries);
});

entryController.getAllPendingEntriesWithinDateRange = catchAsync(
  async (req, res) => {
    const { month, year } = req?.body;
    const { dateFrom, dateTo } = getFirstAndLastDate(month, year);

    const allEntries = await entryService.getAllPendingEntriesWithinDateRange(
      dateFrom,
      dateTo,
      req.organizationId
    );
    if (!allEntries || allEntries.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No Pending Entries");
    }

    const entries = await Promise.all(
      allEntries.map(async (item) => {
        const user = await userService.getUserByUserId(item?.userId);
        return {
          ...item?._doc,
          user,
        };
      })
    );
    res.send(entries);
  }
);

entryController.getEntryById = catchAsync(async (req, res) => {
  const entry = await entryService.getEntryById(req.params.id);
  if (!entry) {
    throw new ApiError(httpStatus.NOT_FOUND, "Entry not found");
  }
  res.send(entry);
});

entryController.updateEntryById = catchAsync(async (req, res) => {
  if (req?.body?.entryDate.toISOString().includes("T19")) {
    req.body.entryDate.setUTCDate(req.body.entryDate.getUTCDate() + 1);
    req.body.entryDate.setUTCHours(0, 0, 0, 0);
  }
  if (req?.body?.startDate.toISOString().includes("T19")) {
    req.body.startDate.setUTCDate(req.body.startDate.getUTCDate() + 1);
    req.body.startDate.setUTCHours(0, 0, 0, 0);
  }
  if (req?.body?.expiryDate.toISOString().includes("T19")) {
    req.body.expiryDate.setUTCDate(req.body.expiryDate.getUTCDate() + 1);
    req.body.expiryDate.setUTCHours(0, 0, 0, 0);
  }
  const entry = await entryService.getEntryById(req?.params?.id);
  if (!entry) throw new ApiError(httpStatus.NOT_FOUND, "Entry Not Found");
  else {
    const Package = await packageService.getPackageById(req?.body?.package);
    if (Package?.rateType === "day") {
      const days = getDaysBetweenDates(
        req?.body?.startDate,
        req?.body?.expiryDate
      );
      const purchaseRate = Math.ceil((Package?.purchaseRate / 31) * days);
      req.body.purchaseRateOriginal = purchaseRate;
      req.body.purchaseRate = purchaseRate;
    } else {
      req.body.purchaseRateOriginal = Package?.purchaseRate;
      req.body.purchaseRate = Package?.purchaseRate;
    }

    if (req?.body?.ipType === "static") {
      const Isp = await ispService.getIspById(req.body?.isp);
      req.body.saleRate =
        +req?.body?.saleRate + +req?.body?.staticIpSaleRate;
      req.body.purchaseRate = +req?.body?.purchaseRate + +Isp?.staticIpRate;
    }

    const Entry = await entryService.updateEntryById(
      req?.params?.id,
      req?.body
    );

    const isUser = await userService.getUserByUserId(req.body.userId);
    const expiryDate = moment(new Date(req?.body?.expiryDate)).format(
      "DD MMM, YYYY"
    );
    let paymentMethod = getPaymentMethodNameByKey(req?.body?.paymentMethod);
    paymentMethod = paymentMethod === "NET" ? "Cash" : paymentMethod;
    const tid = req?.body?.tid === "" ? `Payment Method: ${paymentMethod}` : `TID ${req?.body?.tid}, Payment Method: ${paymentMethod}`;
    if (
      isUser?.mobile &&
      req?.body?.sendAlertMessage &&
      req?.body?.paymentMethod !== "pending"
    ) {
      await sendTemplateForEntryPayment(isUser?.mobile, isUser?.fullname, isUser?.userId, Package?.isp?.vlan, tid, expiryDate);
    }

    res.send(Entry);
  }
});

entryController.deleteEntryBy = catchAsync(async (req, res) => {
  const entry = await entryService.getEntryById(req?.params?.id);
  if (!entry) throw new ApiError(httpStatus.NOT_FOUND, "Entry Not Found");
  else {
    await ispService.updateIspById(entry?.isp?.id, {
      openingBalance: entry?.isp?.openingBalance + entry?.package?.purchaseRate,
    });
    const Entry = await entryService.deleteEntry(req?.params?.id);
    res.send(Entry);
  }
});

module.exports = entryController;