"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("country", "site_logo", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "asset_media",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("city", "site_logo", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "asset_media",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("region", "site_logo", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "asset_media",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("country", "site_logo");
    await queryInterface.removeColumn("city", "site_logo");
    await queryInterface.removeColumn("region", "site_logo");
  },
};
