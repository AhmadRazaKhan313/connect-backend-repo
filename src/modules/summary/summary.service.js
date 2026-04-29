const httpStatus = require("http-status");
const {
  EntryModel,
  InvoiceModel,
  ExpenseModel,
  StaffModel,
  ExtraIncomeModel,
} = require("../../models");
const { ispService } = require("../../services");
const ApiError = require("../../utils/ApiError");
let summaryService = {};

summaryService.getSummaryByIsp = async (dateFrom, dateTo, organizationId) => {
  if (dateTo.toISOString().includes("T19")) {
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);
    dateTo.setUTCHours(0, 0, 0, 0);
  }
  const isps = await ispService.getAllIsps(organizationId);
  const data = Promise.all(
    isps.map(async (isp) => {
      const totalInvoice = await getTotalInvoice(isp, dateFrom, dateTo, organizationId);
      const totalInvoiceSent = await getTotalInvoiceSent(isp, dateFrom, dateTo, organizationId);
      const totalEntryPending = await getTotalEntryPending(isp, dateFrom, dateTo, organizationId);
      const totalBalance = totalInvoice - totalInvoiceSent;
      const totalIncome = await getTotalIncome(isp, dateFrom, dateTo, organizationId);
      const totalProfit = totalIncome - totalInvoiceSent;
      return {
        isp,
        totalInvoice,
        totalInvoiceSent,
        totalBalance,
        totalEntryPending,
        totalIncome,
        totalProfit,
      };
    })
  );
  return data;
};

summaryService.getCompanyExpense = async (dateFrom, dateTo, organizationId) => {
  if (dateTo.toISOString().includes("T19")) {
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);
    dateTo.setUTCHours(0, 0, 0, 0);
  }
  const data = await ExpenseModel.find({
    organizationId,
    spentBy: "company",
    status: "completed",
    deleted: { $ne: true },
    date: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    },
  });
  return data.reduce((acc, item) => (acc += +item?.amount), 0);
};

summaryService.getPartnersTotalEpxense = async (dateFrom, dateTo, organizationId) => {
  if (dateTo.toISOString().includes("T19")) {
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);
    dateTo.setUTCHours(0, 0, 0, 0);
  }
  const data = await ExpenseModel.find({
    organizationId,
    spentBy: { $ne: "company" },
    status: "completed",
    deleted: { $ne: true },
    date: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    },
  });
  return data.reduce((acc, item) => (acc += +item?.amount), 0);
};

summaryService.getPartnersEpxenses = async (dateFrom, dateTo, companyProfit, organizationId) => {
  if (dateTo.toISOString().includes("T19")) {
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);
    dateTo.setUTCHours(0, 0, 0, 0);
  }
  const partners = await StaffModel.find({
    organizationId,
    type: { $in: ["partner", "superadmin"] },
  });

  const data = Promise.all(
    partners.map(async (partner) => {
      const expense = await ExpenseModel.find({
        organizationId,
        spentBy: partner.id,
        status: "completed",
        deleted: { $ne: true },
        date: {
          $gte: new Date(dateFrom),
          $lte: new Date(dateTo),
        },
      });
      const partnerExpense = expense.reduce(
        (acc, item) => (acc += +item.amount),
        0
      );
      const partnerProfit = (companyProfit * partner.share) / 100;
      return {
        partnerId: partner.id,
        fullname: partner.fullname,
        expense: partnerExpense,
        profit: partnerProfit,
        remainingProfit: partnerProfit - partnerExpense,
        share: partner?.share,
      };
    })
  );

  return data;
};

summaryService.getTotalExtraIncome = async (dateFrom, dateTo, organizationId) => {
  if (dateTo.toISOString().includes("T19")) {
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);
    dateTo.setUTCHours(0, 0, 0, 0);
  }
  const data = await ExtraIncomeModel.find({
    organizationId,
    paymentMethod: { $ne: "completed" },
    date: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    },
  });
  return data.reduce((acc, item) => (acc += +item?.amount), 0);
};

async function getTotalInvoice(isp, dateFrom, dateTo, organizationId) {
  if (dateTo.toISOString().includes("T19")) {
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);
    dateTo.setUTCHours(0, 0, 0, 0);
  }
  const data = await EntryModel.find({
    organizationId,
    isp: isp?.id,
    entryDate: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    },
  }).populate("package");
  return data.reduce((acc, item) => (acc += +item?.purchaseRate), 0);
}

async function getTotalIncome(isp, dateFrom, dateTo, organizationId) {
  if (dateTo.toISOString().includes("T19")) {
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);
    dateTo.setUTCHours(0, 0, 0, 0);
  }
  const data = await EntryModel.find({
    organizationId,
    isp: isp?.id,
    paymentMethod: { $ne: "pending" },
    entryDate: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    },
  }).populate("package");
  return data.reduce((acc, item) => (acc += +item?.saleRate), 0);
}

async function getTotalEntryPending(isp, dateFrom, dateTo, organizationId) {
  if (dateTo.toISOString().includes("T19")) {
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);
    dateTo.setUTCHours(0, 0, 0, 0);
  }
  const data = await EntryModel.find({
    organizationId,
    isp: isp?.id,
    paymentMethod: "pending",
    entryDate: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    },
  }).populate("package");
  return data.reduce((acc, item) => (acc += +item?.package?.saleRate), 0);
}

async function getTotalInvoiceSent(isp, dateFrom, dateTo, organizationId) {
  if (dateTo.toISOString().includes("T19")) {
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);
    dateTo.setUTCHours(0, 0, 0, 0);
  }
  const data = await InvoiceModel.find({
    organizationId,
    isp: isp?.id,
    date: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    },
  });
  return data.reduce((acc, item) => (acc += +item?.amount), 0);
}

module.exports = summaryService;