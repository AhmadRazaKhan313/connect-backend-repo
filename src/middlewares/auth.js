const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const roleService = require('../modules/role/role.service');
const { StaffModel } = require('../models');

const isPlatformSA  = (u) => u?.role === 'platformSuperAdmin' || u?.type === 'platformSuperAdmin';
const isOrgSuperAdmin = (u) => u?.role === 'orgSuperAdmin' || u?.type === 'orgSuperAdmin';
const isOrgAdmin    = (u) => u?.role === 'orgAdmin' || u?.type === 'orgAdmin' || u?.type === 'admin' || u?.type === 'superadmin';

const verifyCallback = (req, resolve, reject, requiredPermissions) => async (err, jwtUser, info) => {
    if (err || info || !jwtUser) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    try {
        // Always fresh from DB — role changes take effect immediately
        const user = await StaffModel.findById(jwtUser._id || jwtUser.id).lean();
        if (!user) return reject(new ApiError(httpStatus.UNAUTHORIZED, 'User no longer exists'));

        req.user = user;
        req.organizationId = user.organizationId || null;

        // ── Special: platformSuperAdmin-only routes ────────────────────────
        if (requiredPermissions.includes('platformSuperAdmin')) {
            if (!isPlatformSA(user)) {
                return reject(new ApiError(httpStatus.FORBIDDEN, 'Access denied — Platform Super Admin only'));
            }
            return resolve();
        }

        // ── Platform Super Admin — full access ─────────────────────────────
        if (isPlatformSA(user)) return resolve();

        // ── Routes with required permissions ──────────────────────────────
        if (requiredPermissions.length) {

            // orgSuperAdmin / orgAdmin — full access within their org
            if (isOrgSuperAdmin(user) || isOrgAdmin(user)) return resolve();

            // orgStaff — check role permissions from DB
            if (user.roleId) {
                const role = await roleService.getRoleById(user.roleId);

                if (!role) {
                    return reject(new ApiError(
                        httpStatus.FORBIDDEN,
                        'Assigned role not found in database — contact admin'
                    ));
                }

                // role.permissions is plain array (lean) — direct includes works
                const storedPermissions = Array.isArray(role.permissions) ? role.permissions : [];

                const missingPermissions = requiredPermissions.filter(p => !storedPermissions.includes(p));

                if (missingPermissions.length > 0) {
                    return reject(new ApiError(
                        httpStatus.FORBIDDEN,
                        `Insufficient permissions. Missing: ${missingPermissions.join(', ')}`
                    ));
                }

                return resolve();
            }

            return reject(new ApiError(httpStatus.FORBIDDEN, 'No role assigned to this staff member'));
        }

        // ── No specific permissions required — just authenticated ──────────
        resolve();

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