const crypto = require("crypto");
const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

/**
 * User = an ISP subscriber / end-customer. Users do NOT log in and have no roles
 * or permissions, but they still obey the platform-wide identity & tenancy rules:
 *  - Every user has an auto-generated, immutable, unique UUID.
 *  - Every user MUST belong to exactly one organization (organizationId required).
 *
 * `userId` remains the human-facing ISP account identifier (e.g. "ali123").
 */
const UserSchema = mongoose.Schema(
  {
    // Auto-generated unique UUID  never null, immutable.
    uuid: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: () => crypto.randomUUID(),
    },

    fullname: {
      type: String,
      required: [true, "Full Name is required"],
    },
    email: {
      type: String,
    },
    // Human-facing ISP account id (unique per platform).
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

    // MANDATORY  no user may exist outside an organization.
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "OrganizationId is required"],
      index: true,
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

UserSchema.plugin(toJSON);
UserSchema.plugin(paginate);

/**
 * @typedef User
 */
const User = mongoose.model("User", UserSchema);

module.exports = User;
