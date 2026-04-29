const httpStatus = require("http-status");
const PackageModel = require("./package.model");
const ApiError = require("../../utils/ApiError");
let packageService = {};

/**
 * Ceate Package
 * @param {Object} PackageBody
 * @returns {Promise<PackageModel>}
 */
packageService.createPackage = async (PackageBody) => {
  return await PackageModel.create(PackageBody);
};

/**
 * Get All Packages
 * @returns {Promise<PackageModel>}
 */
packageService.getAllPackages = async () => {
  return PackageModel.find({});
};

/**
 * Get Package By Id
 * @param {ObjectId} id
 * @returns {Promise<PackageModel>}
 */
packageService.getPackageById = async (id) => {
  return PackageModel.findById(id).populate("isp");
};

/**
 * Get Package By Isp
 * @param {ObjectId} isp
 * @returns {Promise<PackageModel>}
 */
packageService.getPackageByIsp = async (isp) => {
  return PackageModel.find({ isp }).populate("isp");
};

/**
 * Update Package By Id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<PackageModel>}
 */
packageService.updatePackageById = async (id, updateBody) => {
  await PackageModel.updateOne({ _id: id }, updateBody);
  return "Package Updated";
};

/**
 * Delete Package By Id
 * @param {ObjectId} id
 */
packageService.deletePackageById = async (id) => {
  await PackageModel.deleteOne({ _id: id });
  return "Package Deleted";
};

module.exports = packageService;
