const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { expenseService, staffService } = require("../../services");
const { s3 } = require("../../services/s3Service");
const { assertSameOrg } = require("../../utils/tenant");

let expenseController = {};

// Whether the current account may approve expenses (auto-complete on create).
const canApproveExpense = (req) =>
  Array.isArray(req.user?.permissions) && req.user.permissions.includes("expense.approve");

expenseController.createExpense = catchAsync(async (req, res) => {
  if (req?.body?.date.toISOString().includes("T19")) {
    req.body.date.setUTCDate(req.body.date.getUTCDate() + 1);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  const file = req?.file;

  // Accounts that cannot approve expenses send large expenses (> 999) for approval.
  let newExpense = req?.body;
  if (!canApproveExpense(req) && req?.body?.amount > 999) {
    newExpense = {
      ...newExpense,
      staff: req?.user?.id,
      status: "pending",
      organizationId: req.organizationId,
    };
  } else {
    newExpense = {
      ...newExpense,
      staff: req?.user?.id,
      status: "completed",
      organizationId: req.organizationId,
    };
  }

  const expense = await expenseService.createExpense(newExpense);
  if (!expense) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Something went wrong");
  }

  try {
    if (file) {
      const key = `${expense?.id || expense?._id}`;
      const params = {
        Bucket: `${process.env.AWS_BUCKET_NAME}/expenses`,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const response = await s3.upload(params).promise();
      await expenseService.updateExpenseById(expense?.id, {
        ...expense?._doc,
        image: response?.Location,
      });
    }
    // Email notification to approvers can be re-enabled here once email is configured.
    res.status(httpStatus.CREATED).send({ expense });
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Failed to upload image");
  }
});

expenseController.getAllExpenses = catchAsync(async (req, res) => {
  const expenses = await expenseService.getAllExpenses(
    req?.body?.startDate,
    req?.body?.endDate,
    req?.body?.spentBy,
    req.organizationId
  );
  if (!expenses || expenses.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Expenses Yet");
  }
  res.send(expenses);
});

expenseController.getCompletedExpenses = catchAsync(async (req, res) => {
  const expenses = await expenseService.getAllExpenses(
    req?.body?.startDate,
    req?.body?.endDate,
    req?.body?.spentBy,
    req.organizationId
  );
  if (!expenses || expenses.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Completed Expenses Yet");
  }

  const newExpenses = await Promise.all(
    expenses.map(async (expense) => {
      if (expense?.spentBy !== "company") {
        const spentBy = await staffService.getStaffById(expense?.spentBy);
        return { ...expense._doc, spentBy };
      }
      return expense;
    })
  );

  res.send({
    expenses: newExpenses,
    total: expenses.reduce(
      (acc, item) => (acc += item?.status === "completed" ? +item?.amount : 0),
      0
    ),
  });
});

expenseController.getPendingExpenses = catchAsync(async (req, res) => {
  const allExpenses = await expenseService.getAllExpensesByStatus(
    req?.body?.startDate,
    req?.body?.endDate,
    "pending",
    req.organizationId
  );
  if (!allExpenses || allExpenses.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Pending Expenses Yet");
  }

  const expenses = await Promise.all(
    allExpenses.map(async (expense) => {
      if (expense?.spentBy !== "company") {
        const spentBy = await staffService.getStaffById(expense?.spentBy);
        return { ...expense._doc, spentBy };
      }
      return expense;
    })
  );

  res.send({
    expenses,
    total: expenses.reduce((acc, item) => (acc += +item?.amount), 0),
  });
});

expenseController.approveExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  assertSameOrg(expense, req, "Expense");
  const Expense = await expenseService.updateExpenseById(req?.params?.id, { status: "completed" });
  res.send(Expense);
});

expenseController.reverseExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  assertSameOrg(expense, req, "Expense");
  const Expense = await expenseService.updateExpenseById(req?.params?.id, { status: "reversed" });
  res.send(Expense);
});

expenseController.reviveExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  assertSameOrg(expense, req, "Expense");
  const Expense = await expenseService.updateExpenseById(req?.params?.id, { status: "completed" });
  res.send(Expense);
});

// NOTE: admin-approve / admin-decline are public email-link endpoints (no auth/org context).
expenseController.approveExpenseByAdmin = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  if (!expense || expense?.status !== "pending") return res.send("Expense Not Found");
  const Expense = await expenseService.updateExpenseById(req?.params?.id, { status: "completed" });
  res.send(Expense ? "Expense Approved" : "Something went wrong");
});

expenseController.declineExpenseByAdmin = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  if (!expense || expense?.status !== "pending") return res.send("Expense Not Found");
  const Expense = await expenseService.updateExpenseById(req?.params?.id, {
    deleted: true,
    status: "deleted",
  });
  res.send(Expense ? "Expense Declined" : "Expense not found");
});

expenseController.getExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.expenseId || req.params.id);
  assertSameOrg(expense, req, "Expense");
  res.send(expense);
});

expenseController.updateExpenseById = catchAsync(async (req, res) => {
  if (req?.body?.date.toISOString().includes("T19")) {
    req.body.date.setUTCDate(req.body.date.getUTCDate() + 1);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  const expense = await expenseService.getExpenseById(req?.params?.id);
  assertSameOrg(expense, req, "Expense");
  const Expense = await expenseService.updateExpenseById(req?.params?.id, req?.body);
  res.send(Expense);
});

expenseController.deleteExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  assertSameOrg(expense, req, "Expense");
  await expenseService.updateExpenseById(req?.params?.id, { deleted: true, status: "deleted" });
  res.send("Expense Deleted");
});

module.exports = expenseController;
