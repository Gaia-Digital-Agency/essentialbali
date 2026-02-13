// 20250828014640-create-table-property-location.cjs
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("property_location", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      city: { type: Sequelize.STRING, allowNull: false },
      region: { type: Sequelize.STRING },
      country: { type: Sequelize.STRING, defaultValue: "Bali" },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("property_location");
  },
};
