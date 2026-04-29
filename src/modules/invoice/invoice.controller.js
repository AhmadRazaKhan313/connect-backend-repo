const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { invoiceService, ispService, entryService } = require("../../services");
let invoiceController = {};

invoiceController.createInvoice = catchAsync(async (req, res) => {
  if (req?.body?.date.toISOString().includes("T19")) {
    req.body.date.setUTCDate(req.body.date.getUTCDate() + 1);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  const isIsp = await ispService.getIspById(req.body.isp);
  if (!isIsp) throw new ApiError(httpStatus.NOT_FOUND, "Isp Not Found");
  else {
    const invoice = await invoiceService.createInvoice({ ...req.body, organizationId: req.organizationId });
    await ispService.updateIspById(isIsp?.id, {
      openingBalance: isIsp?.openingBalance + req?.body?.amount,
    });
    res.status(httpStatus.CREATED).send(invoice);
  }
});

invoiceController.getAllInvoices = catchAsync(async (req, res) => {
  const entries = await entryService.getAlCompletedlEntries(
    req?.body?.startDate,
    req?.body?.endDate,
    req?.body?.isp,
    req.organizationId
  );
  if (!entries || entries.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Completed Entries");
  }
  res.send({
    entries,
    total: entries.reduce((acc, item) => (acc += +item?.purchaseRate), 0),
  });
});

invoiceController.getSentInvoices = catchAsync(async (req, res) => {
  const invoices = await invoiceService.getSentInvoices(
    req?.body?.startDate,
    req?.body?.endDate,
    req?.body?.isp,
    req.organizationId
  );
  if (!invoices || invoices.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Sent Invoices");
  }
  res.send({
    invoices,
    total: invoices.reduce((acc, item) => (acc += +item?.amount), 0),
  });
});

invoiceController.getInvoiceById = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
  }
  res.send(invoice);
});

invoiceController.updateInvoiceById = catchAsync(async (req, res) => {
  if (req?.body?.date.toISOString().includes("T19")) {
    req.body.date.setUTCDate(req.body.date.getUTCDate() + 1);
    req.body.date.setUTCHours(0, 0, 0, 0);
  }
  const invoice = await invoiceService.getInvoiceById(req?.params?.id);
  if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, "Invoice Not Found");
  else {
    const Invoice = await invoiceService.updateInvoiceById(
      req?.params?.id,
      req?.body
    );
    res.send(Invoice);
  }
});

invoiceController.deleteInvoice = catchAsync(async (req, res) => {
  const { id } = req?.params;
  const invoice = await invoiceService.getInvoiceById(id);
  if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, "Invoice Not Found");
  else {
    await ispService.updateIspById(invoice?.isp?.id, {
      openingBalance: +invoice?.isp?.openingBalance + invoice?.amount,
    });
    const Invoice = await invoiceService.deleteInvoiceById(req?.params?.id);
    res.send(Invoice);
  }
});

module.exports = invoiceController;