const httpStatus = require("http-status");
const ExpenseModel = require("./expense.model");
let expenseService = {};

/**
 * Ceate Expense
 * @param {Object} ExpenseBody
 * @returns {Promise<ExpenseModel>}
 */
expenseService.createExpense = async (ExpenseBody) => {
  return await ExpenseModel.create(ExpenseBody);
};

/**
 * Get Expense by expense by Id
 * @param {ObjectId} id
 * @returns {Promise<ExpenseModel>}
 */
expenseService.getExpenseById = async (id) => {
  return ExpenseModel.findById(id).populate("staff");
};

/**
 * Get All Expenses
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} spentBy
 * @param {ObjectId} organizationId
 * @returns {Promise<ExpenseModel>}
 */
expenseService.getAllExpenses = async (startDate, endDate, spentBy, organizationId) => {
  if (endDate.toISOString().includes("T19")) {
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    endDate.setUTCHours(0, 0, 0, 0);
  }
  const filter = {
    date:
      endDate === "" || startDate === endDate
        ? new Date(startDate)
        : { $gte: new Date(startDate), $lte: new Date(endDate) },
    spentBy,
  };
  if (organizationId) filter.organizationId = organizationId;
  return ExpenseModel.find(filter).sort({ date: 1 }).populate("staff");
};

/**
 * Get All Expenses By Status
 * @param {String} startDate
 * @param {String} endDate
 * @param {String} status
 * @param {ObjectId} organizationId
 * @returns {Promise<ExpenseModel>}
 */
expenseService.getAllExpensesByStatus = async (startDate, endDate, status, organizationId) => {
  if (endDate.toISOString().includes("T19")) {
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    endDate.setUTCHours(0, 0, 0, 0);
  }
  const filter = {
    date:
      endDate === "" || startDate === endDate
        ? new Date(startDate)
        : { $gte: new Date(startDate), $lte: new Date(endDate) },
    status,
  };
  if (organizationId) filter.organizationId = organizationId;
  return ExpenseModel.find(filter).sort({ date: 1 }).populate("staff");
};

/**
 * Update Expense By Id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<ExpenseModel>}
 */
expenseService.updateExpenseById = async (id, updateBody) => {
  await ExpenseModel.updateOne({ _id: id }, updateBody);
  return "Expense Updated";
};

/**
 * Delete Expense By Id
 * @param {ObjectId} id
 */
expenseService.deleteExpenseById = async (id) => {
  await ExpenseModel.deleteOne({ _id: id }).populate("staff");
  return "Expense Deleted";
};

module.exports = expenseService;