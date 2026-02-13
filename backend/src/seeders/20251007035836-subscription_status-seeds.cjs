"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM subscription_status",
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (Number(existing[0]?.count || 0) > 0) {
      return;
    }

    await queryInterface.bulkInsert(
      "subscription_status",
      [
        {
          code: 1,
          description: "Active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          code: 2,
          description: "Unsubscribed",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await queryInterface.bulkDelete("subscription_status", null, {});
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
