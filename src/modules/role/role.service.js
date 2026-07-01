const Role = require("./role.model");

const roleService = {};

roleService.createRole = async (body) => {
  return Role.create(body);
};

roleService.getAllRoles = async (organizationId) => {
  const filter = {};
  if (organizationId) filter.organizationId = organizationId;
  return Role.find(filter).sort({ createdAt: 1 });
};

roleService.getRoleById = async (id) => {
  return Role.findById(id);
};

roleService.updateRole = async (id, body) => {
  return Role.findByIdAndUpdate(id, body, { new: true, runValidators: true });
};

roleService.deleteRole = async (id) => {
  return Role.findByIdAndDelete(id);
};

/**
 * Roles within an org whose permission set includes a given permission.
 * Used to find which accounts can perform a permission-gated action.
 */
roleService.getRoleIdsWithPermission = async (permission, organizationId) => {
  const filter = { permissions: permission };
  if (organizationId) filter.organizationId = organizationId;
  const roles = await Role.find(filter).select("_id");
  return roles.map((r) => r._id);
};

module.exports = roleService;
