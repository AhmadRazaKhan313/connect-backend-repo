const { OrganizationModel } = require("../models");

const subdomainMiddleware = async (req, res, next) => {
  try {
    const host = req.headers.host; // e.g. bahawalpur.localhost:4000
    const subdomain = host.split(".")[0]; // "bahawalpur"

    // Ignore if localhost has common name 
    const ignored = ["localhost", "www", "api", "127"];
    if (!ignored.includes(subdomain) && subdomain !== host.split(":")[0]) {
      const org = await OrganizationModel.findOne({
        subdomain,
        status: "active",
      });
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