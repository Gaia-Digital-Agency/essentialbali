"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("articles", {
      fields: ["featured_image"],
      type: "foreign key",
      name: "fk_articles_featured_image",
      references: {
        table: "asset_media",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await queryInterface.removeConstraint(
      "articles",
      "fk_articles_featured_image"
    );

    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
