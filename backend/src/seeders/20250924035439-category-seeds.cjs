"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM category",
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (Number(existing[0]?.count || 0) > 0) {
      return;
    }

    const rows = [
      {
        title: "News",
        slug_title: "news",
        description:
          "Latest updates, announcements, and trending stories from across Bali.",
      },
      {
        title: "Events",
        slug_title: "events",
        description:
          "Festivals, parties, cultural events, and must-attend happenings in Bali.",
      },
      {
        title: "Stays",
        slug_title: "stays",
        description:
          "Handpicked villas, resorts, hotels, and unique accommodations across Bali.",
      },
      {
        title: "Dine",
        slug_title: "dine",
        description:
          "Top restaurants, cafes, beach clubs, and culinary experiences in Bali.",
      },
      {
        title: "Health & Wellness",
        slug_title: "health-wellness",
        description:
          "Spas, yoga studios, fitness centers, and holistic wellness experiences in Bali.",
      },
      {
        title: "Nightlife",
        slug_title: "nightlife",
        description:
          "Best bars, clubs, live music spots, and after-dark experiences in Bali.",
      },
      {
        title: "Activities",
        slug_title: "activities",
        description:
          "Adventures, tours, water sports, and exciting things to do around Bali.",
      },
      {
        title: "People & Culture",
        slug_title: "people-culture",
        description:
          "Stories of local communities, traditions, art, and culture that shape Bali.",
      },
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
      "ALTER TABLE category AUTO_INCREMENT = 1",
    );
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
