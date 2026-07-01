const catchAsync = require("../../utils/catchAsync");
const organizationService = require("./organization.service");
const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");

let organizationController = {};

// Can the requester view organizations other than their own?
const canViewAnyOrg = (req) =>
  Array.isArray(req.userPermissions) && req.userPermissions.includes("organization.view");

organizationController.updateFeatures = catchAsync(async (req, res) => {
  await organizationService.updateOrganization(req.params.id, { features: req.body.features });
  res.send({ message: "Features updated" });
});

organizationController.createOrganization = catchAsync(async (req, res) => {
  const existingEmail = await organizationService.getOrganizationByEmail(req.body.email);
  if (existingEmail) throw new ApiError(httpStatus.BAD_REQUEST, "Organization email already registered");

  const existingSubdomain = await organizationService.getOrganizationBySubdomain(req.body.subdomain);
  if (existingSubdomain) throw new ApiError(httpStatus.BAD_REQUEST, "Subdomain already taken");

  const org = await organizationService.createOrganization(req.body);
  res.status(httpStatus.CREATED).send(org);
});

organizationController.getAllOrganizations = catchAsync(async (req, res) => {
  const orgs = await organizationService.getAllOrganizations();
  res.send(orgs);
});

// The requesting account's own organization (any authenticated user, for branding).
organizationController.getMyOrganization = catchAsync(async (req, res) => {
  const org = await organizationService.getOrganizationById(req.organizationId);
  if (!org) throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  res.send(org);
});

organizationController.getOrganizationById = catchAsync(async (req, res) => {
  // Without organization.view, an account may only read its own organization.
  if (!canViewAnyOrg(req) && req.params.id !== req.organizationId?.toString()) {
    throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  }
  const org = await organizationService.getOrganizationById(req.params.id);
  if (!org) return res.status(httpStatus.NOT_FOUND).send({ message: "Organization not found" });
  res.send(org);
});

organizationController.updateOrganization = catchAsync(async (req, res) => {
  const result = await organizationService.updateOrganization(req.params.id, req.body);
  res.send({ message: "Organization Updated", data: result });
});

organizationController.updateStatus = catchAsync(async (req, res) => {
  const org = await organizationService.getOrganizationById(req.params.id);
  if (!org) throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  if (org.isPlatform)
    throw new ApiError(httpStatus.FORBIDDEN, "The Platform Organization status cannot be changed");
  const result = await organizationService.updateStatus(req.params.id, req.body.status);
  res.send({ message: result });
});

organizationController.deleteOrganization = catchAsync(async (req, res) => {
  const org = await organizationService.getOrganizationById(req.params.id);
  if (!org) throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  if (org.isPlatform)
    throw new ApiError(httpStatus.FORBIDDEN, "The Platform Organization cannot be deleted");
  if (req.params.id === req.organizationId?.toString())
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot delete your own organization");
  const result = await organizationService.deleteOrganization(req.params.id);
  res.send({ message: result });
});

organizationController.uploadLogo = catchAsync(async (req, res) => {
  const { logo } = req.body;
  if (!logo) throw new ApiError(httpStatus.BAD_REQUEST, "No logo provided");
  await organizationService.updateOrganization(req.params.id, { logo });
  res.send({ message: "Logo updated successfully", logoUrl: logo });
});

module.exports = organizationController;
