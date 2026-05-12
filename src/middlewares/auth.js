const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const roleService = require('../modules/role/role.service');

const verifyCallback = (req, resolve, reject, requiredPermissions) => async (err, user, info) => {
    if (err || info || !user) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    try {
        req.user = user;
        req.organizationId = user.organizationId || null;

        // platformSuperAdmin — full access to everything (ISP, orgs, all data)
        const isPlatformSuperAdmin =
            user.role === 'platformSuperAdmin' ||
            user.type === 'platformSuperAdmin';

        if (isPlatformSuperAdmin) {
            req.organizationId = user.organizationId;
            return resolve();
        }

        if (requiredPermissions.length) {
            // orgSuperAdmin / orgAdmin — full access within their own org
            if (
                user.role === 'orgSuperAdmin' ||
                user.role === 'orgAdmin' ||
                user.type === 'orgSuperAdmin' ||
                user.type === 'orgAdmin' ||
                user.type === 'admin' ||
                user.type === 'superadmin'
            ) return resolve();

            // orgStaff — check roleId permissions
            if (user.roleId) {
                const role = await roleService.getRoleById(user.roleId);
                if (role) {
                    const hasPermission = requiredPermissions.every(p =>
                        role.permissions.includes(p)
                    );
                    if (!hasPermission) {
                        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden — insufficient permissions'));
                    }
                    return resolve();
                }
            }

            return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden — no role assigned'));
        }

        resolve();
    } catch (err) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Error: ' + err.message));
    }
};

const auth = (...requiredPermissions) => async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate(
            'jwt',
            { session: false },
            verifyCallback(req, resolve, reject, requiredPermissions)
        )(req, res, next);
    })
        .then(() => next())
        .catch((err) => next(err));
};

module.exports = auth;
