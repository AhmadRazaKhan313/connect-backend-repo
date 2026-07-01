const httpStatus = require("http-status");
const ApiError = require("./ApiError");

/**
 * Multi-tenant object-level guard.
 *
 * Ensures a fetched document belongs to the requester's organization. Strict for
 * everyone  there is no platform-wide bypass. The only cross-organization
 * capability in the system is organization management itself, which is gated by
 * `organization.*` permissions on dedicated routes (not through this helper).
 *
 * A mismatch is reported as 404 (not 403) so other tenants' record ids cannot be
 * probed.
 */
const assertSameOrg = (doc, req, label = "Resource") => {
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, `${label} not found`);
  }
  const docOrg = doc.organizationId ? doc.organizationId.toString() : null;
  const reqOrg = req.organizationId ? req.organizationId.toString() : null;

  if (!reqOrg || docOrg !== reqOrg) {
    throw new ApiError(httpStatus.NOT_FOUND, `${label} not found`);
  }
  return doc;
};

/** Base query filter scoped to the requester's organization. */
const orgScopedFilter = (req, extra = {}) => ({
  ...extra,
  organizationId: req.organizationId,
});

module.exports = { assertSameOrg, orgScopedFilter };
