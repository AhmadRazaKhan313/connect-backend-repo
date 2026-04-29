const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

const ExpenseSchema = mongoose.Schema(
  {
    //common fields
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    spentBy: {
      type: String,
      required: [true, "Spent By is required"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment Method is required"],
    },
    tid: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    details: {
      type: String,
      required: [true, "Details are required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
    },
    image: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    organizationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Organization',
  default: null,
},
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ExpenseSchema.plugin(toJSON);
ExpenseSchema.plugin(paginate);

/**
 * @typedef Expense
 */
const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
