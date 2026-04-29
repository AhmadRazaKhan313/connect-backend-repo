const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

const EntrySchema = mongoose.Schema(
  {
    //common fields
    isp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Isp",
      required: [true, "Isp is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
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
    comments: {
      type: String,
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
EntrySchema.plugin(toJSON);
EntrySchema.plugin(paginate);

/**
 * @typedef Invoice
 */
const Invoice = mongoose.model("Invoice", EntrySchema);

module.exports = Invoice;
