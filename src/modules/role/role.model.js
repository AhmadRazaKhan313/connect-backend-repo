const mongoose = require("mongoose");
const { toJSON, paginate } = require("../../models/plugins");

/**
 * A custom, organization-scoped role  a named set of feature permissions.
 *
 * Every non-SUPER_ADMIN account is assigned exactly one Role, and inherits that
 * role's permissions. Roles are created and managed per organization.
 */
const RoleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
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
  },
  { timestamps: true }
);

RoleSchema.plugin(toJSON);
RoleSchema.plugin(paginate);

const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
