const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

const SmsSendingSchema = mongoose.Schema(
  {
    //common fields
    smsSending: {
      type: Boolean,
      required: [true, "SmsSending is required"],
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
SmsSendingSchema.plugin(toJSON);
SmsSendingSchema.plugin(paginate);

/**
 * @typedef SmsSending
 */
const SmsSendingModel = mongoose.model("SmsSending", SmsSendingSchema);

module.exports = SmsSendingModel;
