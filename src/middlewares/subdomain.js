const { OrganizationModel } = require("../models");

/**
 * Resolves the current organization from the request subdomain and attaches:
 *   - req.subdomainOrgId       (ObjectId)  used by auth() to block cross-org access
 *   - req.currentOrganization  (document)  used for branding / org context
 *
 * Runs before authentication. In local/dev hosts without a tenant subdomain
 * (localhost, www, api, 127, plain host) it is a no-op.
 */
const subdomainMiddleware = async (req, res, next) => {
  try {
    const host = (req.headers.host || "").toString(); // e.g. bahawalpur.localhost:4000
    const hostname = host.split(":")[0]; // strip port
    const parts = hostname.split(".");
    const subdomain = parts[0];

    const ignored = ["localhost", "local", "www", "api", "127"];

    // Need at least sub.domain and a real, non-ignored subdomain label.
    if (parts.length >= 2 && subdomain && !ignored.includes(subdomain)) {
      const org = await OrganizationModel.findOne({ subdomain, status: "active" });
      if (org) {
        req.currentOrganization = org;
        req.subdomainOrgId = org._id;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = subdomainMiddleware;
