const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const roleService = require('../modules/role/role.service');

const MASTER_ORG_ID = '69e6ea81f25b8158cf1c62ac';

const verifyCallback = (req, resolve, reject, requiredPermissions) => async (err, user, info) => {
    if (err || info || !user) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    try {
        req.user = user;
        req.organizationId = user.organizationId || null;

        // Master admin check
        const isMasterAdmin = user.organizationId?.toString() === MASTER_ORG_ID
            && (user.role === 'orgSuperAdmin' || user.type === 'orgSuperAdmin');

        // Master admin — no org filter, full access
        if (isMasterAdmin) {
        req.organizationId = user.organizationId; 
            return resolve();
}

        if (requiredPermissions.length) {
            // orgAdmin or orgSuperAdmin — full access within their org
            if (
                user.role === 'orgAdmin' ||
                user.role === 'orgSuperAdmin' ||
                user.type === 'orgAdmin' ||
                user.type === 'orgSuperAdmin' ||
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