"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("articles", "current_version_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "article_versions",
        key: "id",
      },
      after: "slug_title",
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("articles", "current_version_id");
  },
};
