const httpStatus = require("http-status");
const EntryModel = require("./entry.model");
const ApiError = require("../../utils/ApiError");
const { getTomorrowDate } = require("../../utils/helpers");
const { userService } = require("../../services");
let entryService = {};

/**
 * Ceate Entry
 * @param {Object} EntryBody
 * @returns {Promise<EntryModel>}
 */
entryService.createEntry = async (EntryBody) => {
  const newEntry = await EntryModel.create(EntryBody);
  const entry = await EntryModel.findById(newEntry.id || newEntry._id)
    .populate("isp")
    .populate("package");
  const user = await userService.getUserByUserId(entry.userId);
  return { ...entry._doc, user };
};

/**
 * Get All Completed Entries
 * @param {String} startDate
 * @param {String} endDate
 * @param {ObjectId} isp
 * @param {ObjectId} organizationId
 * @returns {Promise<EntryModel>}
 */
entryService.getAlCompletedlEntries = async (startDate, endDate, isp, organizationId) => {
  if (endDate.toISOString().includes("T19")) {
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    endDate.setUTCHours(0, 0, 0, 0);
  }

  let query = { isp };
  if (organizationId) query.organizationId = organizationId;
  if (!endDate || endDate === "" || startDate.getTime() === endDate.getTime()) {
    query.entryDate = startDate;
  } else {
    query.entryDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  return await EntryModel.find(query).populate("isp").populate("package");
};

/**
 * Get All Completed Entries Without ISP
 * @param {String} startDate
 * @param {String} endDate
 * @param {ObjectId} organizationId
 * @returns {Promise<EntryModel>}
 */
entryService.getAlCompletedlEntriesWithoutIsp = async (startDate, endDate, organizationId) => {
  let query = { paymentMethod: { $ne: "pending" } };
  if (organizationId) query.organizationId = organizationId;
  if (!endDate || endDate === "" || startDate.getTime() === endDate.getTime()) {
    query.entryDate = startDate;
  } else {
    query.entryDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  return await EntryModel.countDocuments(query);
};

/**
 * Get All Pending Entries
 * @param {ObjectId} organizationId
 * @returns {Promise<EntryModel>}
 */
entryService.getAlPendinglEntries = async (organizationId) => {
  const filter = { paymentMethod: "pending" };
  if (organizationId) filter.organizationId = organizationId;
  return await EntryModel.find(filter)
    .populate("isp")
    .populate("package");
};

/**
 * Get All Pending Entries Without ISP
 * @param {String} startDate
 * @param {String} endDate
 * @param {ObjectId} organizationId
 * @returns {Promise<EntryModel>}
 */
entryService.getAllPendingEntriesWithoutIsp = async (startDate, endDate, organizationId) => {
  let query = { paymentMethod: "pending" };
  if (organizationId) query.organizationId = organizationId;
  if (!endDate || endDate === "" || startDate.getTime() === endDate.getTime()) {
    query.entryDate = startDate;
  } else {
    query.entryDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  return await EntryModel.countDocuments(query);
};

/**
 * Get All Pending Entries Within date range
 * @param {String} startDate
 * @param {String} endDate
 * @param {ObjectId} organizationId
 * @returns {Promise<EntryModel>}
 */
entryService.getAllPendingEntriesWithinDateRange = async (startDate, endDate, organizationId) => {
  if (endDate.toISOString().includes("T19")) {
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    endDate.setUTCHours(0, 0, 0, 0);
  }

  let query = { paymentMethod: "pending" };
  if (organizationId) query.organizationId = organizationId;
  if (!endDate || endDate === "" || startDate.getTime() === endDate.getTime()) {
    query.entryDate = startDate;
  } else {
    query.entryDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  return await EntryModel.find(query).populate("isp").populate("package");
};

/**
 * Get All Pending Entries
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @returns {Promise<EntryModel>}
 */
entryService.getAlPendinglEntriesBetweenDate = async (dateFrom, dateTo, organizationId) => {
  const filter = {
    paymentMethod: "pending",
    entryDate: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
  };
  if (organizationId) filter.organizationId = organizationId;
  return await EntryModel.find(filter)
    .populate("isp")
    .populate("package");
};

/**
 * Get Entry by entry by Id
 * @param {ObjectId} id
 * @returns {Promise<EntryModel>}
 */
entryService.getEntryById = async (id) => {
  return await EntryModel.findById(id).populate("isp").populate("package");
};

/**
 * Get Entry by entry by ISP
 * @param {ObjectId} isp
 * @returns {Promise<EntryModel>}
 */
entryService.getEntriesByISPWithValidExpiry = async (isp) => {
  return await EntryModel.find({
    isp,
    expiryDate: { $gte: new Date() },
  });
};

/**
 * Update Entry By Id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<EntryModel>}
 */
entryService.updateEntryById = async (id, updateBody) => {
  await EntryModel.updateOne({ _id: id }, updateBody);
  return "Entry Updated";
};

/**
 * Update Entry By Id
 * @param {ObjectId} id
 * @returns {Promise<EntryModel>}
 */
entryService.deleteEntry = async (id) => {
  await EntryModel.deleteOne({ _id: id });
  return "Entry Deleted";
};

entryService.getEntriesToExpireTomorrow = async () => {
  const entries = await EntryModel.find({
    expiryDate: new Date(getTomorrowDate()),
  })
    .populate("package")
    .populate("isp");

  const entriesToExpire = Promise.all(
    entries.map(async (item) => {
      const user = await userService.getUserByUserId(item.userId);
      return {
        entry: item,
        user,
      };
    })
  );

  return entriesToExpire;
};

module.exports = entryService;