const { IspModel } = require("../../models");

let ispService = {};

/**
 * Create isp
 * @param {Object} ispBody
 * @returns {Promise<IspModel>}
 */
ispService.createIsp = async (ispBody) => {
  return await IspModel.create(ispBody);
};

/**
 * Get All isps
 * @param {ObjectId} organizationId
 * @returns {Promise<IspModel>}
 */
ispService.getAllIsps = async (organizationId) => {
  const filter = organizationId ? { organizationId } : {};
  return await IspModel.find(filter);
};

/**
 * Get isp By Id
 * @param {ObjectId} id
 * @returns {Promise<IspModel>}
 */
ispService.getIspById = async (id) => {
  return await IspModel.findById(id);
};

/**
 * Get isp By Vlan
 * @param {ObjectId} vlan
 * @returns {Promise<IspModel>}
 */
ispService.getIspByVlan = async (vlan) => {
  return await IspModel.findOne({ vlan });
};

/**
 * Update isp By Id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<IspModel>}
 */
ispService.updateIspById = async (id, updateBody) => {
  await IspModel.updateOne({ _id: id }, updateBody);
  return "Isp Updated";
};

/**
 * Delete isp By Id
 * @param {ObjectId} id
 */
ispService.deleteIspById = async (id) => {
  await IspModel.deleteOne({ _id: id });
  return "Isp Deleted";
};

module.exports = ispService;