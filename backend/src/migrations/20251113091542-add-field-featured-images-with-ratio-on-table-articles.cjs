"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn("articles", "featured_image_16_9", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "featured_image",
    });

    await queryInterface.addColumn("article_versions", "featured_image_16_9", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "featured_image",
    });

    await queryInterface.addColumn("articles", "featured_image_4_3", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "featured_image",
    });

    await queryInterface.addColumn("article_versions", "featured_image_4_3", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "featured_image",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("articles", "featured_image_16_9");
    await queryInterface.removeColumn(
      "article_versions",
      "featured_image_16_9"
    );
    await queryInterface.removeColumn("articles", "featured_image_4_3");
    await queryInterface.removeColumn(
      "article_versions",
      "featured_image_4_3"
    );
  },
};
