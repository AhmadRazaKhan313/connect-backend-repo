const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

const EntrySchema = mongoose.Schema(
  {
    //common fields
    entryDate: {
      type: Date,
      required: [true, "Entry Date is required"],
    },
    isp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Isp",
      required: [true, "Isp is required"],
    },
    userId: {
      type: String,
      required: [true, "User Id is required"],
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: [true, "Package is required"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment Method is required"],
    },
    tid: {
      type: String,
    },
    ipType: {
      type: String,
      required: [true, "IP Type is required"],
    },
    staticIp: {
      type: String,
    },
    staticIpSaleRate: {
      type: Number,
    },
    saleRate: {
      type: Number,
      required: [true, "Sale Rate is required"],
    },
    saleRateOriginal: {
      type: Number,
      required: [true, "Sale Rate is required"],
    },
    purchaseRate: {
      type: Number,
      required: [true, "Purchase Rate is required"],
    },
    purchaseRateOriginal: {
      type: Number,
      required: [true, "Purchase Rate is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start Date is required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry Date is required"],
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
 * @typedef Entry
 */
const Entry = mongoose.model("Entry", EntrySchema);

module.exports = Entry;
