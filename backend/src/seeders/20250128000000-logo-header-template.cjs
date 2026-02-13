"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users ORDER BY id ASC LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    let actorId = users[0]?.id;
    if (!actorId) {
      await queryInterface.sequelize.query(
        `INSERT INTO Users (id, name, email, password, isActive, user_level, createdAt, updatedAt)
         VALUES (1, 'System Admin', 'system_admin@essentialbali.local', '$2b$10$qDZQ9rODOcmHXLZ8aDXAmOctmtdaxOaKRiy4tWpQESQcBgoMdsoOm', 1, 'super_admin', NOW(), NOW())
         ON DUPLICATE KEY UPDATE id = id`
      );
      actorId = 1;
    }

    // Check if the template already exists
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM article_templating WHERE url = '/logo-header' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      // Update existing template
      await queryInterface.sequelize.query(
        `UPDATE article_templating
         SET content = '{"url": "/logo.png", "id": 0}',
             updatedAt = NOW()
         WHERE url = '/logo-header'`
      );
      console.log("Updated existing /logo-header template");
    } else {
      // Insert new template
      await queryInterface.bulkInsert("article_templating", [
        {
          url: "/logo-header",
          content: JSON.stringify({ url: "/logo.png", id: 0 }),
          template: "logo",
          isActive: true,
          createdBy: actorId,
          updatedBy: actorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("Created new /logo-header template");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("article_templating", {
      url: "/logo-header",
    });
  },
};
