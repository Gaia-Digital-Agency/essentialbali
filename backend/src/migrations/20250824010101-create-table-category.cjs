"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("category", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      sub_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      slug_title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      icon: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "asset_media",
          key: "id",
        },
      },
      is_child: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      id_parent: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("category");
  },
};
