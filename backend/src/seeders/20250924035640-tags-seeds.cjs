"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM tags",
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (Number(existing[0]?.count || 0) > 0) {
      return;
    }

    const now = new Date();
    const tags = [
      { id: 1, name: "Travel", slug: "travel", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
      { id: 2, name: "Jobs", slug: "jobs", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
      { id: 3, name: "Technology", slug: "technology", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
      { id: 4, name: "Education", slug: "education", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
      { id: 5, name: "Food", slug: "food", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
      { id: 6, name: "Events", slug: "events", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
      { id: 7, name: "Health", slug: "health", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
      { id: 8, name: "Housing", slug: "housing", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
      { id: 9, name: "Lifestyle", slug: "lifestyle", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
      { id: 10, name: "Finance", slug: "finance", createdBy: 1, updatedBy: 1, createdAt: now, updatedAt: now },
    ];

    await queryInterface.bulkInsert("tags", tags, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await queryInterface.bulkDelete("tags", null, {
      truncate: true,
      restartIdentity: true,
    });
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    // await queryInterface.sequelize.query(
    //   "ALTER TABLE tags AUTO_INCREMENT = 1"
    // );
  },
};
