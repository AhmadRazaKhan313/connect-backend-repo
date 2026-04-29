const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

const ExtraIncomeSchema = mongoose.Schema(
  {
    //common fields
    date: {
      type: Date,
      required: [true, "date is required"],
    },
    category: {
      type: String,
      required: [true, "category is required"],
    },
    userId: {
      type: String
    },
    amount: {
      type: Number
    },
    paymentMethod: {
      type: String,
      required: [true, "paymentMethod is required"],
    },
    tid: {
      type: String,
    },
    details: {
      type: String,
      required: [true, "details required"],
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
ExtraIncomeSchema.plugin(toJSON);
ExtraIncomeSchema.plugin(paginate);

/**
 * @typedef ExtraIncomeModel
 */
const ExtraIncomeModel = mongoose.model("ExtraIncome", ExtraIncomeSchema);

module.exports = ExtraIncomeModel;
