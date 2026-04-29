const Role = require('./role.model');

const roleService = {};

roleService.createRole = async (body) => {
    return await Role.create(body);
};

roleService.getAllRoles = async (organizationId) => {
    return await Role.find({ organizationId });
};

roleService.getRoleById = async (id) => {
    return await Role.findById(id);
};

roleService.updateRole = async (id, body) => {
    return await Role.findByIdAndUpdate(id, body, { new: true });
};

roleService.deleteRole = async (id) => {
    return await Role.findByIdAndDelete(id);
};

module.exports = roleService;