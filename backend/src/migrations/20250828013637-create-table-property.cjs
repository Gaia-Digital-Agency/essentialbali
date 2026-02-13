// 20250828012718-create-table-property.cjs
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("property", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      type: { type: Sequelize.STRING, allowNull: false },
      bedrooms: { type: Sequelize.INTEGER, defaultValue: 0 },
      bathrooms: { type: Sequelize.INTEGER, defaultValue: 0 },
      capacity: { type: Sequelize.INTEGER, defaultValue: 0 },
      location_id: {
        type: Sequelize.INTEGER,
        references: { model: "property_location", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      price_daily: { type: Sequelize.BIGINT, defaultValue: 0 },
      price_monthly: { type: Sequelize.BIGINT, defaultValue: 0 },
      price_yearly: { type: Sequelize.BIGINT, defaultValue: 0 },
      status: {
        type: Sequelize.ENUM("available", "booked", "maintenance"),
        defaultValue: "available",
      },
      created_by: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      updated_by: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("property");
  },
};
