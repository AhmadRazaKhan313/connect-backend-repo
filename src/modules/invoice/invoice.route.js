const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const invoiceValidation = require('./invoice.validation');
const invoiceController = require('./invoice.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('invoice.create'), validate(invoiceValidation.createInvoice), invoiceController.createInvoice);

router.post(
    '/all-invoices',
    auth('invoice.view'),
    validate(invoiceValidation.getAllInvoices),
    invoiceController.getAllInvoices
);

router.post(
    '/sent-invoices',
    auth('invoice.view'),
    validate(invoiceValidation.getAllInvoices),
    invoiceController.getSentInvoices
);

router
    .route('/:id')
    .get(auth('invoice.view'), validate(invoiceValidation.getInvoiceById), invoiceController.getInvoiceById)
    .patch(auth('invoice.edit'), validate(invoiceValidation.updateInvoice), invoiceController.updateInvoiceById)
    .delete(auth('invoice.delete'), validate(invoiceValidation.getInvoiceById), invoiceController.deleteInvoice);

module.exports = router;
