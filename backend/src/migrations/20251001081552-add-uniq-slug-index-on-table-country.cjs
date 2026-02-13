"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("country", {
      fields: ["slug"],
      type: "unique",
      name: "idx_unique_country_slug",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("country", "idx_unique_country_slug");
  },
};
