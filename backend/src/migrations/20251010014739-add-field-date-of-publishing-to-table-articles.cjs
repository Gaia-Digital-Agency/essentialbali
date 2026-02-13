"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("articles", "publishedBy", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      after: "createdAt",
    });

    await queryInterface.addColumn("articles", "publishedAt", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "publishedBy",
    });

    //add index dengan nama idx_articles_publishedAt
    await queryInterface.addIndex("articles", ["publishedAt"], {
      name: "idx_articles_publishedAt",
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn("articles", "publishedAt");
      await queryInterface.removeColumn("articles", "publishedBy");
    } catch (error) {
      console.error(error);
    }
  },
};
