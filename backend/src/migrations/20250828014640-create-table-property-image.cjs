// 20250828013637-create-table-property-image.cjs
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("property_image", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      property_id: {
        type: Sequelize.INTEGER,
        references: { model: "property", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      image_url: { type: Sequelize.STRING, allowNull: false },
      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
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
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("property_image");
  },
};
