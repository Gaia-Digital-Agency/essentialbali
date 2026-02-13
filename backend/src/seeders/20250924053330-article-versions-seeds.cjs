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
        "Canggu",
        "Seminyak",
        "Kuta",
        "Legian",
        "Ubud",
        "Uluwatu",
        "Jimbaran",
        "Sanur",
        "Nusa Dua",
        "Ungasan",
        "Pecatu",
        "Kutuh",
        "Sawangan",
        "Kerobokan",
        "Umalas",
        "Denpasar",
        "Candidasa",
        "Amed",
        "Tulamben",
        "Padangbai",
        "Sidemen",
        "Amlapura",
        "Klungkung",
        "Tirta Gangga",
        "Bedugul",
        "Kintamani",
        "Munduk",
        "Lovina",
        "Singaraja",
        "Baturiti",
        "Bangli",
        "Jatiluwih",
        "Pemuteran",
        "Medewi",
        "Negara",
        "Gilimanuk",
        "Menjangan Island",
        "Tabanan",
        "Nusa Penida",
        "Nusa Lembongan",
        "Nusa Ceningan",
        "Serangan Island",
      ];
      const nearbyMap = {
        "Canggu": ["Seminyak", "Kerobokan", "Umalas"],
        "Seminyak": ["Canggu", "Kuta", "Legian", "Umalas"],
        "Kuta": ["Legian", "Seminyak", "Jimbaran"],
        "Legian": ["Kuta", "Seminyak", "Canggu"],
        "Ubud": ["Kintamani", "Bangli", "Sidemen", "Denpasar"],
        "Uluwatu": ["Pecatu", "Ungasan", "Kutuh", "Jimbaran"],
        "Jimbaran": ["Uluwatu", "Kuta", "Nusa Dua", "Sawangan"],
        "Sanur": ["Denpasar", "Serangan Island", "Nusa Dua"],
        "Nusa Dua": ["Sawangan", "Kutuh", "Jimbaran", "Sanur"],
        "Ungasan": ["Pecatu", "Kutuh", "Uluwatu"],
        "Pecatu": ["Uluwatu", "Ungasan", "Kutuh"],
        "Kutuh": ["Ungasan", "Pecatu", "Sawangan", "Nusa Dua"],
        "Sawangan": ["Nusa Dua", "Kutuh", "Jimbaran"],
        "Kerobokan": ["Umalas", "Seminyak", "Canggu", "Denpasar"],
        "Umalas": ["Kerobokan", "Seminyak", "Canggu"],
        "Denpasar": ["Sanur", "Kerobokan", "Ubud"],
        "Candidasa": ["Amed", "Padangbai", "Sidemen", "Amlapura"],
        "Amed": ["Tulamben", "Candidasa", "Amlapura", "Tirta Gangga"],
        "Tulamben": ["Amed", "Amlapura", "Tirta Gangga"],
        "Padangbai": ["Candidasa", "Sidemen", "Klungkung"],
        "Sidemen": ["Padangbai", "Amlapura", "Klungkung", "Ubud"],
        "Amlapura": ["Tirta Gangga", "Amed", "Tulamben", "Candidasa"],
        "Klungkung": ["Padangbai", "Sidemen", "Nusa Penida"],
        "Tirta Gangga": ["Amlapura", "Amed", "Tulamben"],
        "Bedugul": ["Baturiti", "Munduk", "Jatiluwih"],
        "Kintamani": ["Bangli", "Ubud", "Baturiti"],
        "Munduk": ["Lovina", "Bedugul", "Baturiti", "Singaraja"],
        "Lovina": ["Singaraja", "Munduk", "Pemuteran"],
        "Singaraja": ["Lovina", "Munduk", "Pemuteran"],
        "Baturiti": ["Bedugul", "Kintamani", "Jatiluwih"],
        "Bangli": ["Kintamani", "Ubud", "Sidemen"],
        "Jatiluwih": ["Tabanan", "Baturiti", "Bedugul", "Medewi"],
        "Pemuteran": ["Menjangan Island", "Lovina", "Singaraja", "Gilimanuk"],
        "Medewi": ["Negara", "Tabanan", "Jatiluwih"],
        "Negara": ["Medewi", "Gilimanuk", "Pemuteran"],
        "Gilimanuk": ["Negara", "Menjangan Island", "Pemuteran"],
        "Menjangan Island": ["Pemuteran", "Gilimanuk", "Negara"],
        "Tabanan": ["Jatiluwih", "Medewi", "Baturiti"],
        "Nusa Penida": ["Nusa Lembongan", "Nusa Ceningan", "Klungkung"],
        "Nusa Lembongan": ["Nusa Ceningan", "Nusa Penida", "Serangan Island"],
        "Nusa Ceningan": ["Nusa Lembongan", "Nusa Penida", "Serangan Island"],
        "Serangan Island": ["Sanur", "Denpasar", "Nusa Lembongan"],
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
