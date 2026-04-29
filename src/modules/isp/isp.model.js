const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

const IspSchema = mongoose.Schema(
  {
    //common fields
    name: {
      type: String,
      required: [true, "Isp Name is required"],
    },
    vlan: {
      type: Number,
      required: [true, "Isp VLAN is required"],
    },
    openingBalance: {
      type: Number,
      required: [true, "Opening Balance is required"],
    },
    color: {
      type: String,
      required: [true, "Isp Color is required"],
    },
    staticIpRate: {
      type: Number,
      required: [true, "Static Ip Rate is required"],
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
    strictPopulate: false,
  }
);

// add plugin that converts mongoose to json
IspSchema.plugin(toJSON);
IspSchema.plugin(paginate);

/**
 * @typedef Isp
 */
const Isp = mongoose.model("Isp", IspSchema);

module.exports = Isp;
