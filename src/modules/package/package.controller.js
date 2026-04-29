const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const { packageService } = require("../../services");
let packageController = {};

packageController.createPackage = catchAsync(async (req, res) => {
  const package = await packageService.createPackage(req.body);
  res.status(httpStatus.CREATED).send(package);
});

packageController.getAllPackages = catchAsync(async (req, res) => {
  const categories = await packageService.getAllPackages();
  if (!categories || categories.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Packages");
  }
  res.send(categories);
});

packageController.getPackageById = catchAsync(async (req, res) => {
  const Package = await packageService.getPackageById(
    req?.params?.id
  );
  if (!Package) {
    throw new ApiError(httpStatus.NOT_FOUND, "Package Not Found");
  }
  res.send(Package);
});

packageController.getPackageByIsp = catchAsync(async (req, res) => {
  const Package = await packageService.getPackageByIsp(
    req?.params?.isp
  );
  if (!Package || Package.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Packages Found");
  }
  res.send(Package);
});

packageController.updatePackageById = catchAsync(async (req, res) => {
  const package = await packageService.getPackageById(
    req?.params?.id
  );
  if (!package) throw new ApiError(httpStatus.NOT_FOUND, "Packages Not Found");
  else {
    const Packages = await packageService.updatePackageById(
      req?.params?.id,
      req?.body
    );
    res.send(Packages);
  }
});

packageController.deletePackageById = catchAsync(async (req, res) => {
  const package = await packageService.getPackageById(
    req?.params?.id
  );
  if (!package) throw new ApiError(httpStatus.NOT_FOUND, "Package Not Found");
  else {
    const Package = await packageService.deletePackageById(
      req?.params?.id
    );
    res.send(Package);
  }
});

module.exports = packageController;
