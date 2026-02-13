"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "id_country", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "country", key: "id" }, // kalau ada table negara
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Users", "id_city", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "city", key: "id" }, // kalau ada table kota
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Users", "user_level", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "user",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "id_country");
    await queryInterface.removeColumn("Users", "id_city");
    await queryInterface.removeColumn("Users", "user_level");
  },
};
