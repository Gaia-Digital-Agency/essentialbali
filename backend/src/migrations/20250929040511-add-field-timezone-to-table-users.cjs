'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Users", "timezone", {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: "id_city",
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    
    await queryInterface.removeColumn("Users", "timezone");

    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  }
};
