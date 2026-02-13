"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("articles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      slug_title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      author: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      category: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "category",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("articles");
  },
};
