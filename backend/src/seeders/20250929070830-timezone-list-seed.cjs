"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM timezones",
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (Number(existing[0]?.count || 0) > 0) {
      return;
    }

    const baliTimezones = [
      {
        timezone_name: "Asia/Makassar",
        utc_offset: "+08:00",
        description: "Bali Standard Time (WITA).",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("timezones", baliTimezones, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("timezones", null, {});
  },
};
