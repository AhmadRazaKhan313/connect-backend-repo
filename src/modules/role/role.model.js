const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const RoleSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        trim: true
    },
    permissions: [{
        type: String,
        trim: true
    }],
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }
}, { timestamps: true });

RoleSchema.plugin(toJSON);
RoleSchema.plugin(paginate);

const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;