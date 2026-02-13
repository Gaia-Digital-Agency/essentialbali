"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("articles", "id_country", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "country",
        key: "id",
      },
      after: "category",
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("articles", "id_city", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "city",
        key: "id",
      },
      after: "id_country",
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("articles", "id_region", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "region",
        key: "id",
      },
      after: "id_city",
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("articles", "id_country");
    await queryInterface.removeColumn("articles", "id_city");
    await queryInterface.removeColumn("articles", "id_region");
  },
};
