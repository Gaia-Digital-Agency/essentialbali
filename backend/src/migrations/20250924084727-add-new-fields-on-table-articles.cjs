"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn("articles", "title", {
        type: Sequelize.STRING(255),
        allowNull: false,
        after: "id",
      });

      await queryInterface.addColumn("articles", "sub_title", {
        type: Sequelize.STRING(255),
        allowNull: true,
        after: "title",
      });

      await queryInterface.addColumn("articles", "article_post", {
        type: Sequelize.TEXT,
        allowNull: false,
        after: "slug_title",
      });

      await queryInterface.addColumn("articles", "tags", {
        type: Sequelize.JSON,
        allowNull: true,
        after: "article_post",
      });

      await queryInterface.addColumn("articles", "featured_image", {
        type: Sequelize.INTEGER,
        allowNull: true,
        after: "tags",
      });

      await queryInterface.addColumn("articles", "meta_data", {
        type: Sequelize.JSON,
        allowNull: true,
        after: "featured_image",
      });

      await queryInterface.addColumn("articles", "status", {
        type: Sequelize.ENUM(
          "draft",
          "pending",
          "published",
          "archived",
          "rejected",
          "scheduled",
          "bin"
        ),
        allowNull: false,
        defaultValue: "draft",
        after: "meta_data",
      });

      await queryInterface.addColumn("articles", "updatedBy", {
        type: Sequelize.INTEGER,
        allowNull: false,
        after: "createdAt",
      });

      await queryInterface.addColumn("articles", "updatedAt", {
        type: Sequelize.DATE,
        allowNull: true,
        after: "updatedBy",
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
    // try {
    //   await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
  
    //   await queryInterface.removeColumn("articles", "updatedAt");
    //   await queryInterface.removeColumn("articles", "updatedBy");
    //   await queryInterface.removeColumn("articles", "status");
    //   await queryInterface.removeColumn("articles", "meta_data");
    //   await queryInterface.removeColumn("articles", "featured_image");
    //   await queryInterface.removeColumn("articles", "tags");
    //   await queryInterface.removeColumn("articles", "article_post");
    //   await queryInterface.removeColumn("articles", "sub_title");
    //   await queryInterface.removeColumn("articles", "title");
  
    //   // Drop ENUM kalau sudah tidak dipakai lagi
    //   // await queryInterface.sequelize.query(
    //   //   "DROP TYPE IF EXISTS enum_article_status;"
    //   // );
    //   await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    // } catch (error) {
    //   console.error(error);
    //   throw error;
    // }
  },
};
