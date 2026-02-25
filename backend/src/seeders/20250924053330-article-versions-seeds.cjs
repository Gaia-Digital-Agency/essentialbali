"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const existingVersions = await queryInterface.sequelize.query(
        "SELECT COUNT(*) AS count FROM article_versions",
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (Number(existingVersions[0]?.count || 0) > 0) {
        return;
      }

      const existingArticles = await queryInterface.sequelize.query(
        "SELECT COUNT(*) AS count FROM articles",
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (Number(existingArticles[0]?.count || 0) === 0) {
        return;
      }

      const AREA_NAMES = [
        "Denpasar",
        "Jimbaran",
        "Canggu",
        "Kuta",
        "Ubud",
        "Nusa Penida",
        "Kintamani",
        "Singaraja",
      ];
      const nearbyMap = {
        Canggu: ["Seminyak", "Kerobokan", "Umalas"],
        Kuta: ["Legian", "Seminyak", "Jimbaran"],
        Ubud: ["Kintamani", "Bangli", "Sidemen", "Denpasar"],
        Jimbaran: ["Uluwatu", "Kuta", "Nusa Dua", "Sawangan"],
        Denpasar: ["Sanur", "Kerobokan", "Ubud"],
        Kintamani: ["Bangli", "Ubud", "Baturiti"],
        Singaraja: ["Lovina", "Munduk", "Pemuteran"],
        "Nusa Penida": ["Nusa Lembongan", "Nusa Ceningan", "Klungkung"],
      };

      const angles = [
        "Where to Stay",
        "Food Scene",
        "Family Trip Guide",
        "Work-Friendly Cafes",
        "Beach Mood Comparison",
        "Nightlife Snapshot",
        "Budget vs Comfort",
        "Wellness Week Plan",
        "Surf and Sea Conditions",
        "Rainy Day Alternatives",
      ];

      const mkTags = (id) => {
        const t1 = ((id - 1) % 10) + 1;
        const t2 = (id % 10) + 1;
        return t1 === t2 ? [t1, ((t2 + 1) % 10) + 1] : [t1, t2];
      };

      const versions = [];
      for (let id = 1; id <= 54; id++) {
        const primary = AREA_NAMES[(id - 1) % AREA_NAMES.length];
        const nearbyNames =
          nearbyMap[primary] ?? AREA_NAMES.filter((name) => name !== primary);
        const secondary = nearbyNames[(id - 1) % nearbyNames.length];
        const angle = angles[(id - 1) % angles.length];
        const title = `${primary} vs ${secondary}: ${angle} in Bali`;

        versions.push({
          id,
          article_id: id,
          title,
          sub_title: `A local comparison of ${primary} and ${secondary} for Bali visitors and residents.`,
          article_post:
            `<p>This version compares <strong>${primary}</strong> and <strong>${secondary}</strong> with a Bali-first perspective.</p>` +
            `<p>We cover accommodation style, food options, movement between neighborhoods, crowd intensity, and who each area fits best.</p>` +
            `<p>Use this writeup to decide your base area in Bali and plan practical day-by-day activities.</p>`,
          tags: JSON.stringify(mkTags(id)),
          featured_image: ((id - 1) % 60) + 1,
          meta_data: JSON.stringify({
            seo_title: `${primary} vs ${secondary} in Bali`,
            seo_desc: `essentialbali comparison guide for ${primary} and ${secondary}.`,
          }),
          status: "published",
          publishedAt: new Date(),
          scheduledAt: null,
          createdAt: new Date(),
          createdBy: 1,
          updatedAt: new Date(),
          updatedBy: 1,
        });
      }

      await queryInterface.bulkInsert("article_versions", versions, {});

      for (let i = 1; i <= 54; i++) {
        await queryInterface.bulkUpdate(
          "articles",
          { current_version_id: i },
          { id: i }
        );
      }
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await queryInterface.bulkDelete("article_versions", null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
    await queryInterface.sequelize.query(
      "ALTER TABLE article_versions AUTO_INCREMENT = 1"
    );
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
