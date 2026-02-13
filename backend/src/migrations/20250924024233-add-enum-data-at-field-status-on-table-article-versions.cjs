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
    await queryInterface.changeColumn("article_versions", "status", {
      type: Sequelize.ENUM(
        "draft",
        "pending",
        "published",
        "archived",
        "rejected",
        "scheduled",
        "bin"
      ),
      allowNull: false,
      defaultValue: "draft",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("article_versions", "status", {
      type: Sequelize.ENUM(
        "draft",
        "pending",
        "published",
        "archived",
        "rejected",
        "scheduled"
      ),
      allowNull: false,
      defaultValue: "draft",
    });
  },
};
