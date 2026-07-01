const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const StaffModel = require('../modules/staff/staff.model');
const RoleModel = require('../modules/role/role.model');

/**
 * Authorization middleware.
 *
 * Usage:
 *   auth()                          -> any authenticated account
 *   auth('isp.view', 'isp.edit')    -> account's role must include ALL listed permissions
 *
 * There are NO hardcoded/system roles. Each account is assigned a DB Role and its
 * permissions come entirely from that role. The "platform super admin" is simply
 * an account whose role includes the `organization.*` permissions.
 *
 * Rules:
 *   - Account + role are re-loaded fresh every request, so permission changes take
 *     effect immediately.
 *   - Strict multi-tenancy: an account may only operate within its own organization
 *     (a subdomain resolving to a different org is rejected). Cross-org access only
 *     exists for organization management, via `organization.*` on dedicated routes.
 */
const loadPermissions = async (staff) => {
    if (!staff.roleId) return [];
    const role = await RoleModel.findById(staff.roleId).lean();
    return role && Array.isArray(role.permissions) ? role.permissions : [];
};

const verifyCallback = (req, resolve, reject, requiredPermissions) => async (err, jwtUser, info) => {
    if (err || info || !jwtUser) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    try {
        const user = await StaffModel.findById(jwtUser._id || jwtUser.id);
        if (!user) {
            return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Account no longer exists'));
        }
        if (!user.organizationId) {
            return reject(new ApiError(httpStatus.FORBIDDEN, 'Account is not associated with any organization'));
        }

        const permissions = await loadPermissions(user);

        // Convenience: expose permissions on the request and the user object.
        user.permissions = permissions;
        req.user = user;
        req.userPermissions = permissions;
        req.organizationId = user.organizationId;

        // Strict tenant isolation: block access via another org's subdomain.
        if (req.subdomainOrgId &&
            user.organizationId.toString() !== req.subdomainOrgId.toString()) {
            return reject(new ApiError(httpStatus.FORBIDDEN, 'Cross-organization access denied'));
        }

        if (requiredPermissions.length) {
            const missing = requiredPermissions.filter((p) => !permissions.includes(p));
            if (missing.length > 0) {
                return reject(new ApiError(
                    httpStatus.FORBIDDEN,
                    `Insufficient permissions. Missing: ${missing.join(', ')}`
                ));
            }
        }

        return resolve();
    } catch (error) {
        return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Auth error: ' + error.message));
    }
};

const auth = (...requiredPermissions) => async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredPermissions))(req, res, next);
    })
        .then(() => next())
        .catch((err) => next(err));
};

module.exports = auth;
