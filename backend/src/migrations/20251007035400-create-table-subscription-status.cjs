"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      
      await queryInterface.createTable("subscription_status", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        code: {
          type: Sequelize.TINYINT,
          allowNull: false,
          unique: true,
          comment: "Status code: 1=active, 2=unsubscribed",
        },
        description: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: "Status description",
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });
  
      // Add index for faster lookups
      await queryInterface.addIndex("subscription_status", ["code"], {
        name: "idx_subscription_status_code",
      });
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("subscription_status");
  },
};
