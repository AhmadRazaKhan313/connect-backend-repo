const ExtraIncomeModel = require("./extra-income.model");
let extraIncomeService = {};

/**
 * Ceate ExtraIncome
 * @param {Object} ExtraIncomeBody
 * @returns {Promise<ExtraIncomeModel>}
 */
extraIncomeService.createExtraIncome = async (ExtraIncomeBody) => {
  const newExtraIncome = await ExtraIncomeModel.create(ExtraIncomeBody);
  return newExtraIncome;
};

/**
 * Get All Completed ExtraIncomes
 * @param {String} startDate
 * @param {String} endDate
 * @param {ObjectId} organizationId
 * @returns {Promise<ExtraIncomeModel>}
 */
extraIncomeService.getAllCompletedExtraIncomes = async (startDate, endDate, organizationId) => {
  if (endDate.toISOString().includes("T19")) {
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    endDate.setUTCHours(0, 0, 0, 0);
  }
  return await ExtraIncomeModel.find({
    organizationId,
    date:
      endDate === "" || startDate === endDate
        ? new Date(startDate)
        : { $gte: new Date(startDate), $lte: new Date(endDate) },
    paymentMethod: { $ne: "pending" },
  });
};

/**
 * Get All Pending ExtraIncomes
 * @param {String} startDate
 * @param {String} endDate
 * @param {ObjectId} organizationId
 * @returns {Promise<ExtraIncomeModel>}
 */
extraIncomeService.getAllPendingExtraIncomes = async (startDate, endDate, organizationId) => {
  if (endDate.toISOString().includes("T19")) {
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    endDate.setUTCHours(0, 0, 0, 0);
  }
  return await ExtraIncomeModel.find({
    organizationId,
    date:
      endDate === "" || startDate === endDate
        ? new Date(startDate)
        : { $gte: new Date(startDate), $lte: new Date(endDate) },
    paymentMethod: "pending",
  });
};

/**
 * Get ExtraIncome by extraIncome by Id
 * @param {ObjectId} id
 * @returns {Promise<ExtraIncomeModel>}
 */
extraIncomeService.getExtraIncomeById = async (id) => {
  return await ExtraIncomeModel.findById(id);
};

/**
 * Update ExtraIncome By Id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<ExtraIncomeModel>}
 */
extraIncomeService.updateExtraIncomeById = async (id, updateBody) => {
  await ExtraIncomeModel.updateOne({ _id: id }, updateBody);
  return "ExtraIncome Updated";
};

/**
 * Update ExtraIncome By Id
 * @param {ObjectId} id
 * @returns {Promise<ExtraIncomeModel>}
 */
extraIncomeService.deleteExtraIncome = async (id) => {
  await ExtraIncomeModel.deleteOne({ _id: id });
  return "ExtraIncome Deleted";
};

module.exports = extraIncomeService;