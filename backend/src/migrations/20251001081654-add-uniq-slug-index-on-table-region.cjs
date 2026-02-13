"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("region", {
      fields: ["slug"],
      type: "unique",
      name: "idx_unique_region_slug",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("region", "idx_unique_region_slug");
  },
};
