const crypto = require("crypto");
const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");
const bcrypt = require("bcryptjs");

/**
 * Staff = an account that can LOG IN.
 *
 * Identity & tenancy rules (enforced strictly):
 *  - Every account has an auto-generated, immutable, unique UUID.
 *  - Every account MUST belong to exactly one organization (organizationId required).
 *  - Every account MUST be assigned exactly one Role (roleId required). Access is
 *    derived entirely from that role's permissions. There are NO hardcoded/system
 *    roles  even the platform super admin is just an account whose role happens
 *    to include the `organization.*` permissions.
 */
const StaffSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: () => crypto.randomUUID(),
    },

    fullname: { type: String, required: [true, "Full Name is required"] },
    email: { type: String, required: [true, "Email is required"] },
    password: { type: String, required: [true, "Password is required"] },
    cnic: { type: String, required: [true, "CNIC is required"] },
    mobile: { type: String, required: [true, "Mobile is required"] },
    address: { type: String, required: [true, "Address is required"] },

    // The account's role  the SOLE source of its permissions.
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "A role is required for every account"],
      index: true,
    },

    // Financial profit-sharing (independent of access).
    isPartner: { type: Boolean, default: false },
    share: { type: Number, default: 0 },

    profileImage: { type: String },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "OrganizationId is required"],
      index: true,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

StaffSchema.plugin(toJSON);
StaffSchema.plugin(paginate);

StaffSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

StaffSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const Staff = mongoose.model("Staff", StaffSchema);
module.exports = Staff;
