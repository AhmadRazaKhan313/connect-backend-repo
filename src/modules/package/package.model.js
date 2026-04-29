const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

const PackageSchema = mongoose.Schema(
  {
    //common fields
    isp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Isp",
    },
    name: {
      type: String,
      required: [true, "Pakcage Name is required"],
    },
    bandwidth: {
      type: Number,
      required: [true, "Bandwidth is required"]
    },
    rateType: {
      type: String,
      required: [true, "Rate Type is required"]
    },
    ratePerDay: {
      type: Number,
    },
    purchaseRate: {
      type: Number,
      required: [true, "Purchase Rate is required"]
    },
    saleRate: {
      type: Number,
      required: [true, "Sale Rate is required"]
    },
    validity: {
      type: Number,
      required: [true, "Validity is required"]
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
    timestamps: true
  }
);

// add plugin that converts mongoose to json
PackageSchema.plugin(toJSON);
PackageSchema.plugin(paginate);

/**
 * @typedef Package
 */
const Package = mongoose.model("Package", PackageSchema);

module.exports = Package;
