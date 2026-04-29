const catchAsync = require("../../utils/catchAsync");
const organizationService = require("./organization.service");
const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");

let organizationController = {};

organizationController.updateFeatures = catchAsync(async (req, res) => {
  const result = await organizationService.updateOrganization(
    req.params.id, 
    { features: req.body.features }
  );
  res.send({ message: "Features updated" });
});

organizationController.createOrganization = catchAsync(async (req, res) => {
  // Email check
  const existingEmail = await organizationService.getOrganizationByEmail(req.body.email);
  if (existingEmail)
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already registered");

  // Subdomain check
  const existingSubdomain = await organizationService.getOrganizationBySubdomain(req.body.subdomain);
  if (existingSubdomain)
    throw new ApiError(httpStatus.BAD_REQUEST, "Subdomain already taken");

  const org = await organizationService.createOrganization(req.body);
  res.status(httpStatus.CREATED).send(org);
});

organizationController.getAllOrganizations = catchAsync(async (req, res) => {
  const orgs = await organizationService.getAllOrganizations();
  res.send(orgs);
});

organizationController.getOrganizationById = catchAsync(async (req, res) => {
  const org = await organizationService.getOrganizationById(req.params.id);
  if (!org) {
    return res.status(httpStatus.NOT_FOUND).send({ message: "Organization not found" });
  }
  res.send(org);
});

organizationController.updateOrganization = catchAsync(async (req, res) => {
  const result = await organizationService.updateOrganization(req.params.id, req.body);
  res.send(result);
});

organizationController.updateStatus = catchAsync(async (req, res) => {
  const result = await organizationService.updateStatus(req.params.id, req.body.status);
  res.send({ message: result });
});

organizationController.deleteOrganization = catchAsync(async (req, res) => {
  const SUPER_ORG_ID = '69e6ea81f25b8158cf1c62ac';
  
  if (req.params.id === SUPER_ORG_ID) {
    throw new ApiError(httpStatus.FORBIDDEN, "Super Organization cannot be deleted");
  }
  if (req.params.id === req.user.organizationId?.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot delete your own organization");
  }

  const result = await organizationService.deleteOrganization(req.params.id);
  res.send({ message: result });
});

module.exports = organizationController;