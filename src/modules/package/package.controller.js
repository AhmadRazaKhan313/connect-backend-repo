const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { packageService } = require("../../services");
const { assertSameOrg } = require("../../utils/tenant");

let packageController = {};

packageController.createPackage = catchAsync(async (req, res) => {
  const package = await packageService.createPackage({ ...req.body, organizationId: req.organizationId });
  res.status(httpStatus.CREATED).send(package);
});

packageController.getAllPackages = catchAsync(async (req, res) => {
  const categories = await packageService.getAllPackages(req.organizationId);
  if (!categories || categories.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Packages");
  }
  res.send(categories);
});

packageController.getPackageById = catchAsync(async (req, res) => {
  const Package = await packageService.getPackageById(req?.params?.id);
  assertSameOrg(Package, req, "Package");
  res.send(Package);
});

packageController.getPackageByIsp = catchAsync(async (req, res) => {
  const Package = await packageService.getPackageByIsp(req?.params?.isp, req.organizationId);
  if (!Package || Package.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Packages Found");
  }
  res.send(Package);
});

packageController.updatePackageById = catchAsync(async (req, res) => {
  const package = await packageService.getPackageById(req?.params?.id);
  assertSameOrg(package, req, "Package");
  const Packages = await packageService.updatePackageById(req?.params?.id, req?.body);
  res.send(Packages);
});

packageController.deletePackageById = catchAsync(async (req, res) => {
  const package = await packageService.getPackageById(req?.params?.id);
  assertSameOrg(package, req, "Package");
  const Package = await packageService.deletePackageById(req?.params?.id);
  res.send(Package);
});

module.exports = packageController;
