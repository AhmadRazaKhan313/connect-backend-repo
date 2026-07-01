const PackageModel = require("./package.model");

let packageService = {};

packageService.createPackage = async (PackageBody) => {
  return PackageModel.create(PackageBody);
};

packageService.getAllPackages = async (organizationId) => {
  const filter = {};
  if (organizationId) filter.organizationId = organizationId;
  return PackageModel.find(filter).populate("isp");
};

packageService.getPackageById = async (id) => {
  return PackageModel.findById(id).populate("isp");
};

packageService.getPackageByIsp = async (isp, organizationId) => {
  const filter = { isp };
  if (organizationId) filter.organizationId = organizationId;
  return PackageModel.find(filter).populate("isp");
};

packageService.updatePackageById = async (id, updateBody) => {
  await PackageModel.updateOne({ _id: id }, updateBody);
  return "Package Updated";
};

packageService.deletePackageById = async (id) => {
  await PackageModel.deleteOne({ _id: id });
  return "Package Deleted";
};

module.exports = packageService;
