const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");
const bcrypt = require("bcryptjs");
const { STAFF_TYPES } = require("../../utils/Constants");

const StaffSchema = mongoose.Schema(
  {
    //common fields
    fullname: {
      type: String,
      required: [true, "Full Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
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
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: [
    STAFF_TYPES.platformSuperAdmin, 
    STAFF_TYPES.orgSuperAdmin, 
    STAFF_TYPES.orgAdmin, 
    STAFF_TYPES.orgStaff,
    'partner',    // ← legacy support
    'admin',      // ← legacy support
    'staff',      // ← legacy support
    'superadmin'  // ← legacy support
],
    },
    share: {
      type: Number,
      required: [
        this.type === STAFF_TYPES.partner || this.type === STAFF_TYPES.admin
          ? true
          : false,
        "Share is required when type is partner",
      ],
    },
    profileImage: {
      type: String,
    },
    // organizationId - superadmin ==> null  and others for required
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
    role: {
  type: String,
 enum: ["platformSuperAdmin", "orgSuperAdmin", "orgAdmin", "orgStaff", null],
default: null,
},
roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null
},
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
StaffSchema.plugin(toJSON);
StaffSchema.plugin(paginate);

/**
 * Check if password matches the Staff's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
StaffSchema.methods.isPasswordMatch = async function (password) {
  const Staff = this;
  return bcrypt.compare(password, Staff.password);
};

StaffSchema.pre("save", async function (next) {
  const Staff = this;
  if (Staff.isModified("password")) {
    Staff.password = await bcrypt.hash(Staff.password, 8);
  }
  next();
});

/**
 * @typedef Staff
 */
const Staff = mongoose.model("Staff", StaffSchema);

module.exports = Staff;