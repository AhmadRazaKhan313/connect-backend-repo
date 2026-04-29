const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

const OrganizationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    logo: {
      type: String,
    },
  primaryColor: {
  type: String,
  default: "#1976d2",
},
secondaryColor: {
  type: String,
  default: "#424242",
},
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // Feature Flags
    features: {
      smsAlerts: { type: Boolean, default: true },
      invoicing: { type: Boolean, default: true },
      expenses: { type: Boolean, default: true },
      extraIncome: { type: Boolean, default: true },
      staffManagement: { type: Boolean, default: true },
      ispManagement: { type: Boolean, default: true },
      dashboard: { type: Boolean, default: true },
    },
    subdomain: {
  type: String,
  required: [true, "Subdomain is required"],
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^[a-z0-9-]+$/, "Invalid subdomain"],
},
  },
  {
    timestamps: true,
    strictPopulate: false,
  }
);

OrganizationSchema.plugin(toJSON);
OrganizationSchema.plugin(paginate);

const OrganizationModel = mongoose.model("Organization", OrganizationSchema);
module.exports = OrganizationModel;