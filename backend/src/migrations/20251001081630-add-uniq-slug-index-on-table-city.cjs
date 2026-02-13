"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("city", {
      fields: ["slug"],
      type: "unique",
      name: "idx_unique_city_slug",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("city", "idx_unique_city_slug");
  },
};
