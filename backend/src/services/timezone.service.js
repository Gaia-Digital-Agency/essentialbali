import db from "../models/index.js";
const { Timezones } = db;


export default {

  async getAll () {
    const timezones = await Timezones.findAll({
      attributes: ["id", "timezone_name", "utc_offset", "description"],
      order: [["timezone_name", "ASC"]],
    });
    return timezones;
  },

}