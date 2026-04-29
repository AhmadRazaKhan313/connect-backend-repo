const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const extraIncomeValidation = require('./extra-income.validation');
const extraIncomeController = require('./extra-income.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('extraIncome.create'), validate(extraIncomeValidation.createExtraIncome), extraIncomeController.createExtraIncome);

router.post(
    '/completed',
    auth('extraIncome.view'),
    validate(extraIncomeValidation.getAllCompletedExtraIncomes),
    extraIncomeController.getAllCompletedExtraIncomes
);

router.post(
    '/pending',
    auth('extraIncome.view'),
    validate(extraIncomeValidation.getAllCompletedExtraIncomes),
    extraIncomeController.getAllPendingExtraIncomes
);

router
    .route('/:id')
    .get(auth('extraIncome.view'), validate(extraIncomeValidation.getExtraIncomeById), extraIncomeController.getExtraIncomeById)
    .patch(auth('extraIncome.edit'), validate(extraIncomeValidation.updateExtraIncome), extraIncomeController.updateExtraIncomeById)
    .delete(auth('extraIncome.delete'), validate(extraIncomeValidation.getExtraIncomeById), extraIncomeController.deleteExtraIncomeById);

module.exports = router;
