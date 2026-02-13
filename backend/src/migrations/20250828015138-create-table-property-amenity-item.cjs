// 20250828015138-create-table-property-amenity-item.cjs
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("property_amenity_item", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      icon: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "asset_media",
          key: "id",
        },
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("property_amenity_item");
  },
};
