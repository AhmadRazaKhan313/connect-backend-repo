const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { expenseService, staffService } = require("../../services");
const { sendEmailByInfo } = require("../../services/email.service");
const { getPaymentMethodNameByKey } = require("../../utils/helpers");
const { STAFF_TYPES } = require("../../utils/Constants");
const { s3 } = require("../../services/s3Service");
let expenseController = {};

expenseController.createExpense = catchAsync(async (req, res) => {
  if (req?.body?.date.toISOString().includes("T19")) {
    req.body.date.setUTCDate(req.body.date.getUTCDate() + 1);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  const admin = await staffService.getStaffsByType(STAFF_TYPES.orgAdmin, req.organizationId);
  const file = req?.file;
  if (!admin || admin.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
  } else {
    let newExpense = req?.body;
    if (req?.user?.type !== STAFF_TYPES.orgAdmin && req?.body?.amount > 999) {
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
    if (expense) {
      try {
        if (file) {
          const key = `${expense?.id || expense?._id}`;
          const params = {
            Bucket: `${process.env.AWS_BUCKET_NAME}/expenses`,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: "public-read",
          };
          const response = await s3.upload(params).promise();
          await expenseService.updateExpenseById(expense?.id, {
            ...expense?._doc,
            image: response?.Location,
          });
        }
        const approveLink = `<a href="${process.env.BASE_URL}/expense/admin-approve/${expense?.id}"><button style="background-color: green; color:white; padding:20px; border:0px solid white; border-radius:10px; margin-right: 40px">Approve</button></a>`;
        const declineLink = `<a href="${process.env.BASE_URL}/expense/admin-decline/${expense?.id}"><button style="background-color: red; color:white; padding:20px; border:0px solid white; border-radius:10px">Decline</button></a>`;
        // await sendEmailByInfo(
        //   admin[0]?.email,
        //   "New Expense Added",
        //   `<html><body><p>A new expense of ${expense?.amount} is added by ${
        //     req?.user?.fullname
        //   }.
        // <br>Details: ${expense?.details}
        // <br>Date: ${expense?.date}
        // <br>Payment Method: ${getPaymentMethodNameByKey(expense?.paymentMethod)}
        // <br>TID: ${expense?.tid}
        // <br>Status: ${newExpense?.status}
        // <br>${approveLink} &nbsp;${declineLink}</p></body></html>`
        // );
        res.status(httpStatus.CREATED).send({ expense });
      } catch (error) {
        console.error("error");
        console.error(error);
        throw new ApiError(500, "Failed to upload image");
      }
    } else {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Something went wrong");
    }
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
        return {
          ...expense._doc,
          spentBy,
        };
      } else {
        return expense;
      }
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
        return {
          ...expense._doc,
          spentBy,
        };
      } else {
        return expense;
      }
    })
  );

  res.send({
    expenses,
    total: expenses.reduce((acc, item) => (acc += +item?.amount), 0),
  });
});

expenseController.approveExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  if (!expense) throw new ApiError(httpStatus.NOT_FOUND, "Expense Not Found");
  else {
    const Expense = await expenseService.updateExpenseById(req?.params?.id, {
      status: "completed",
    });
    res.send(Expense);
  }
});

expenseController.reverseExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  if (!expense) throw new ApiError(httpStatus.NOT_FOUND, "Expense Not Found");
  else {
    const Expense = await expenseService.updateExpenseById(req?.params?.id, {
      status: "reversed",
    });
    res.send(Expense);
  }
});

expenseController.reviveExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  if (!expense) throw new ApiError(httpStatus.NOT_FOUND, "Expense Not Found");
  else {
    const Expense = await expenseService.updateExpenseById(req?.params?.id, {
      status: "completed",
    });
    res.send(Expense);
  }
});

expenseController.approveExpenseByAdmin = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  if (!expense || expense?.status !== "pending") res.send("Expense Not Found");
  else {
    const Expense = await expenseService.updateExpenseById(req?.params?.id, {
      status: "completed",
    });
    if (Expense) {
      // await sendEmailByInfo(...)
      res.send("Expense Approved");
    } else {
      res.send("Something went wrong");
    }
  }
});

expenseController.declineExpenseByAdmin = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  if (!expense || expense?.status !== "pending") res.send("Expense Not Found");
  else {
    const Expense = await expenseService.updateExpenseById(req?.params?.id, {
      deleted: true,
      status: "deleted",
    });
    if (Expense) {
      // await sendEmailByInfo(...)
      res.send("Expense Declined");
    } else {
      res.send("Expense not found");
    }
  }
});

expenseController.getExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.expenseId);
  if (!expense) {
    throw new ApiError(httpStatus.NOT_FOUND, "Expense not found");
  }
  res.send(expense);
});

expenseController.updateExpenseById = catchAsync(async (req, res) => {
  if (req?.body?.date.toISOString().includes("T19")) {
    req.body.date.setUTCDate(req.body.date.getUTCDate() + 1);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  const expense = await expenseService.getExpenseById(req?.params?.id);
  if (!expense) throw new ApiError(httpStatus.NOT_FOUND, "Expense Not Found");
  else {
    const Expense = await expenseService.updateExpenseById(
      req?.params?.id,
      req?.body
    );
    res.send(Expense);
  }
});

expenseController.deleteExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req?.params?.id);
  if (!expense) throw new ApiError(httpStatus.NOT_FOUND, "Expense Not Found");
  else {
    await expenseService.updateExpenseById(req?.params?.id, {
      deleted: true,
      status: "deleted",
    });
    res.send("Expense Deleted");
  }
});

module.exports = expenseController;