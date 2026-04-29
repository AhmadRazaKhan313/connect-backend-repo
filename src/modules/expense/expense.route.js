const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const expenseValidation = require('./expense.validation');
const expenseController = require('./expense.controller');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 5 }
});

const router = express.Router();

router
    .route('/')
    .post(
        upload.single('image'),
        auth('expense.create'),
        validate(expenseValidation.createExpense),
        expenseController.createExpense
    );

router.post(
    '/completed',
    auth('expense.view'),
    validate(expenseValidation.getAllExpenses),
    expenseController.getCompletedExpenses
);

router.post(
    '/pending',
    auth('expense.view'),
    validate(expenseValidation.getPendingExpenses),
    expenseController.getPendingExpenses
);

router.get(
    '/approve/:id',
    auth('expense.approve'),
    validate(expenseValidation.getExpenseById),
    expenseController.approveExpense
);

router.get(
    '/reverse/:id',
    auth('expense.approve'),
    validate(expenseValidation.getExpenseById),
    expenseController.reverseExpense
);

router.get(
    '/revive/:id',
    auth('expense.approve'),
    validate(expenseValidation.getExpenseById),
    expenseController.reviveExpense
);

router.get(
    '/admin-approve/:id',
    validate(expenseValidation.getExpenseById),
    expenseController.approveExpenseByAdmin
);

router.get(
    '/admin-decline/:id',
    validate(expenseValidation.getExpenseById),
    expenseController.declineExpenseByAdmin
);

router
    .route('/:id')
    .get(validate(expenseValidation.getExpenseById), expenseController.getExpenseById)
    .patch(auth('expense.edit'), validate(expenseValidation.updateExpense), expenseController.updateExpenseById)
    .delete(auth('expense.delete'), validate(expenseValidation.getExpenseById), expenseController.deleteExpenseById);

module.exports = router;
