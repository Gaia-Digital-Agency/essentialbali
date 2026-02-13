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
      `SELECT id FROM article_templating WHERE url = '/about' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aboutContent = {
      title: "About essentialbali",
      description: "essentialbali is a Bali area guide for travelers, expats, and locals, featuring dining, events, schools, wellness, and local travel insights across the island.",
      link: "/about",
      image: {
        url: "/logo.png",
        alt: "essentialbali"
      }
    };

    if (existing.length > 0) {
      // Update existing template
      await queryInterface.sequelize.query(
        `UPDATE article_templating
         SET content = '${JSON.stringify(aboutContent).replace(/'/g, "''")}',
             updatedAt = NOW()
         WHERE url = '/about'`
      );
      console.log("Updated existing /about template");
    } else {
      // Insert new template
      await queryInterface.bulkInsert("article_templating", [
        {
          url: "/about",
          content: JSON.stringify(aboutContent),
          template: "about",
          isActive: true,
          createdBy: actorId,
          updatedBy: actorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("Created new /about template");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("article_templating", {
      url: "/about",
    });
  },
};
