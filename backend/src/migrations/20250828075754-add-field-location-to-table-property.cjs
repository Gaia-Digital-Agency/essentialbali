"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("property", "id_country", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "country", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("property", "id_city", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "city", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("property", "id_region", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "region", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("property", "id_country");
    await queryInterface.removeColumn("property", "id_city");
    await queryInterface.removeColumn("property", "id_region");
  },
};
