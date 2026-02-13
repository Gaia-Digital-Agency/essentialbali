"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("article_versions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      article_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "articles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      sub_title: { type: Sequelize.STRING(255), allowNull: true },
      article_post: { type: Sequelize.TEXT, allowNull: false },
      tags: { type: Sequelize.JSON, allowNull: true },
      featured_image: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "asset_media",
          key: "id",
        },
      },
      meta_data: { type: Sequelize.JSON, allowNull: true },
      status: {
        type: Sequelize.ENUM(
          "draft",
          "pending",
          "published",
          "archived",
          "rejected",
          "scheduled"
        ),
        defaultValue: "draft",
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("article_versions");
  },
};
