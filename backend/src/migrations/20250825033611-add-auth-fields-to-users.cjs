"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "isActive", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });

    await queryInterface.addColumn("Users", "lastLoginAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "loginAttempts", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Users", "lockedUntil", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "isActive");
    await queryInterface.removeColumn("Users", "lastLoginAt");
    await queryInterface.removeColumn("Users", "loginAttempts");
    await queryInterface.removeColumn("Users", "lockedUntil");
  },
};
