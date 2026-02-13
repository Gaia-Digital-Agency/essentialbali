"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable("timezones", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        timezone_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        // Offset dari UTC (e.g., '+07:00')
        utc_offset: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        // Deskripsi atau nama lokal (e.g., 'Western Bali Time')
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("timezones");
  },
};
