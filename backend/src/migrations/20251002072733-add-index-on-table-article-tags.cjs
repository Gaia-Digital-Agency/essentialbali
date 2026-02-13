"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("article_tags", {
      fields: ["id_article", "id_tag"],
      type: "unique",
      name: "uq_article_tag",
    });

    await queryInterface.addIndex("article_tags", ["id_article"]);
    await queryInterface.addIndex("article_tags", ["id_tag"]);
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint("article_tags", "uq_article_tag");
    // await queryInterface.removeIndex("article_tags", "id_article");
    // await queryInterface.removeIndex("article_tags", "id_tag");
  },
};
