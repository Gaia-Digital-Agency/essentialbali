"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const existingArticles = await queryInterface.sequelize.query(
        "SELECT COUNT(*) AS count FROM articles",
        { type: Sequelize.QueryTypes.SELECT },
      );
      if (Number(existingArticles[0]?.count || 0) > 0) {
        return;
      }

      const categoryRows = await queryInterface.sequelize.query(
        "SELECT id FROM category ORDER BY id ASC",
        { type: Sequelize.QueryTypes.SELECT },
      );
      const categories = categoryRows.map((row) => row.id);
      if (!categories.length) {
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

      const slugify = (value) =>
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const areas = AREA_NAMES.map((name, index) => ({
        id_country: index + 1,
        id_city: index + 1,
        id_region: index + 1,
        name,
        slug: slugify(name),
      }));

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

      const rows = [];
      for (let id = 1; id <= 54; id++) {
        const primary = areas[(id - 1) % areas.length];
        const nearbyNames =
          nearbyMap[primary.name] ??
          AREA_NAMES.filter((name) => name !== primary.name);
        const secondaryName = nearbyNames[(id - 1) % nearbyNames.length];
        const secondary =
          areas.find((area) => area.name === secondaryName) ??
          areas[id % areas.length];
        const angle = angles[(id - 1) % angles.length];
        const title = `${primary.name} vs ${secondary.name}: ${angle} in Bali`;
        const slug_title = `${primary.slug}-vs-${secondary.slug}-${angle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}-${id}`;

        rows.push({
          id,
          slug_title,
          current_version_id: null,
          author: "essentialbali Team",
          category: categories[(id - 1) % categories.length],
          parent_category_id: null,
          id_country: primary.id_country,
          id_city: primary.id_city,
          id_region: primary.id_region,
          createdBy: 1,
          createdAt: new Date(),
          pinned: id <= 6 ? 1 : 0,
          title,
          sub_title: `A local comparison of ${primary.name} and ${secondary.name} for Bali visitors and residents.`,
          article_post:
            `<p><strong>${primary.name}</strong> and <strong>${secondary.name}</strong> offer different Bali experiences. This guide compares both areas for travelers, remote workers, and long-stay guests.</p>` +
            `<p>In ${primary.name}, you can expect a stronger focus on local rhythms, neighborhood spots, and easy access to nearby attractions. ${secondary.name} is usually preferred for visitors looking for a different mix of restaurants, crowds, and day-to-night activities.</p>` +
            `<p>Use this comparison to decide where to stay, eat, and spend your time based on pace, budget, transport, and daily lifestyle in Bali.</p>`,
          tags: JSON.stringify(mkTags(id)),
          featured_image: ((id - 1) % 60) + 1,
          meta_data: JSON.stringify({
            seo_title: `${primary.name} vs ${secondary.name} in Bali`,
            seo_desc: `Compare ${primary.name} and ${secondary.name} in Bali for stays, food, lifestyle, and practical travel planning.`,
          }),
          status: "published",
          updatedBy: 1,
          updatedAt: new Date(),
          publishedAt: new Date(),
          publishedBy: 1,
        });
      }

      await queryInterface.bulkInsert("articles", rows, {});
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await queryInterface.bulkDelete("articles", null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
    await queryInterface.sequelize.query(
      "ALTER TABLE articles AUTO_INCREMENT = 1",
    );
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
