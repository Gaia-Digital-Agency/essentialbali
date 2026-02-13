"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM category",
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (Number(existing[0]?.count || 0) > 0) {
      return;
    }

    const rows = [
      { title: "Events", slug_title: "events", description: "Bali events and happenings." },
      { title: "Deals", slug_title: "deals", description: "Bali deals and savings." },
      { title: "Featured", slug_title: "featured", description: "Featured Bali stories and highlights." },
      { title: "Ultimate Guide", slug_title: "ultimate-guide", description: "Comprehensive Bali area guides." },
      { title: "Health & Wellness", slug_title: "health-wellness", description: "Health and wellness in Bali." },
      { title: "Directory", slug_title: "directory", description: "Bali services, venues, and directories." },
      { title: "Nature Adventure", slug_title: "nature-adventure", description: "Nature and adventure experiences in Bali." },
      { title: "Most Popular", slug_title: "most-popular", description: "Most popular picks in Bali." },
      { title: "Area Highlights", slug_title: "area-highlights", description: "Highlights from other Bali areas." },
    ].map((item) => ({
      title: item.title,
      sub_title: item.title,
      slug_title: item.slug_title,
      description: item.description,
      template_name: "template_name",
      createdBy: 1,
      updatedBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("category", rows, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await queryInterface.bulkDelete("category", null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
    await queryInterface.sequelize.query(
      "ALTER TABLE category AUTO_INCREMENT = 1"
    );
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
