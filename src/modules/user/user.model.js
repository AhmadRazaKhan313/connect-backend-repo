const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema(
  {
    //common fields
    fullname: {
      type: String,
      required: [true, "Full Name is required"],
    },
    email: {
      type: String,
    },
    userId: {
      type: String,
      required: [true, "User Id is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    cnic: {
      type: String,
      required: [true, "CNIC is required"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
UserSchema.plugin(toJSON);
UserSchema.plugin(paginate);

/**
 * @typedef User
 */
const User = mongoose.model("User", UserSchema);

module.exports = User;