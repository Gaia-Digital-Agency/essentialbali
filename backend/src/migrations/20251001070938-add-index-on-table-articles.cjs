"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Index untuk title
    await queryInterface.addIndex("articles", ["title"], {
      name: "articles_title_idx",
      using: "BTREE",
    });

    // Index untuk pinned DESC, updatedAt DESC
    await queryInterface.addIndex("articles", ["pinned", "updatedAt"], {
      name: "articles_order_desc_pinned_updatedat_idx",
      using: "BTREE",
      order: {
        pinned: "DESC",
        updatedAt: "DESC",
      },
    });

    // Index untuk featured_image
    await queryInterface.addIndex("articles", ["featured_image"], {
      name: "articles_featured_image_idx",
      using: "BTREE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await queryInterface.removeIndex("articles", "articles_title_idx");
    await queryInterface.removeIndex(
      "articles",
      "articles_order_desc_pinned_updatedat_idx"
    );
    await queryInterface.removeIndex("articles", "articles_featured_image_idx");
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
