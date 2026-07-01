/**
 * FEATURE PERMISSIONS  the single source of truth for access.
 *
 * There are NO hardcoded roles. Every account is assigned a custom Role (a DB
 * document) and inherits that role's permissions. Two auto-created roles bootstrap
 * the system:
 *   - the Platform Organization's "Super Admin" role gets ALL permissions,
 *     including `organization.*` (the only permissions that allow managing other
 *     organizations).
 *   - every other organization's "Super Admin" role gets ALL permissions EXCEPT
 *     `organization.*` (so org owners run their own org but cannot manage others).
 */
const PERMISSIONS = {
    // Organization management (platform-level  managing OTHER organizations)
    ORGANIZATION_VIEW: 'organization.view',
    ORGANIZATION_CREATE: 'organization.create',
    ORGANIZATION_EDIT: 'organization.edit',
    ORGANIZATION_DELETE: 'organization.delete',

    // Dashboard
    DASHBOARD_VIEW: 'dashboard.view',

    // ISP
    ISP_VIEW: 'isp.view',
    ISP_CREATE: 'isp.create',
    ISP_EDIT: 'isp.edit',
    ISP_DELETE: 'isp.delete',

    // Package
    PACKAGE_VIEW: 'package.view',
    PACKAGE_CREATE: 'package.create',
    PACKAGE_EDIT: 'package.edit',
    PACKAGE_DELETE: 'package.delete',

    // User (ISP subscribers)
    USER_VIEW: 'user.view',
    USER_CREATE: 'user.create',
    USER_EDIT: 'user.edit',
    USER_DELETE: 'user.delete',

    // Staff (organization accounts)
    STAFF_VIEW: 'staff.view',
    STAFF_CREATE: 'staff.create',
    STAFF_EDIT: 'staff.edit',
    STAFF_DELETE: 'staff.delete',

    // Roles (custom per-organization roles)
    ROLE_VIEW: 'role.view',
    ROLE_CREATE: 'role.create',
    ROLE_EDIT: 'role.edit',
    ROLE_DELETE: 'role.delete',

    // Entry
    ENTRY_VIEW: 'entry.view',
    ENTRY_CREATE: 'entry.create',
    ENTRY_EDIT: 'entry.edit',
    ENTRY_DELETE: 'entry.delete',

    // Expense
    EXPENSE_VIEW: 'expense.view',
    EXPENSE_CREATE: 'expense.create',
    EXPENSE_EDIT: 'expense.edit',
    EXPENSE_APPROVE: 'expense.approve',
    EXPENSE_DELETE: 'expense.delete',

    // Invoice
    INVOICE_VIEW: 'invoice.view',
    INVOICE_CREATE: 'invoice.create',
    INVOICE_EDIT: 'invoice.edit',
    INVOICE_DELETE: 'invoice.delete',

    // Extra Income
    EXTRA_INCOME_VIEW: 'extraIncome.view',
    EXTRA_INCOME_CREATE: 'extraIncome.create',
    EXTRA_INCOME_EDIT: 'extraIncome.edit',
    EXTRA_INCOME_DELETE: 'extraIncome.delete',
};

const PERMISSION_VALUES = Object.values(PERMISSIONS);

// Platform-only permissions (managing other organizations).
const ORGANIZATION_PERMISSIONS = [
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_CREATE,
    PERMISSIONS.ORGANIZATION_EDIT,
    PERMISSIONS.ORGANIZATION_DELETE,
];

// Everything a normal organization needs  full access WITHIN one org.
const ORG_LEVEL_PERMISSIONS = PERMISSION_VALUES.filter(
    (p) => !ORGANIZATION_PERMISSIONS.includes(p)
);

const isValidPermission = (p) => PERMISSION_VALUES.includes(p);

const sanitizePermissions = (input) => {
    if (!Array.isArray(input)) return [];
    return [...new Set(input.filter(isValidPermission))];
};

module.exports = PERMISSIONS;
module.exports.PERMISSIONS = PERMISSIONS;
module.exports.PERMISSION_VALUES = PERMISSION_VALUES;
module.exports.ALL_PERMISSIONS = PERMISSION_VALUES;
module.exports.ORGANIZATION_PERMISSIONS = ORGANIZATION_PERMISSIONS;
module.exports.ORG_LEVEL_PERMISSIONS = ORG_LEVEL_PERMISSIONS;
module.exports.isValidPermission = isValidPermission;
module.exports.sanitizePermissions = sanitizePermissions;
