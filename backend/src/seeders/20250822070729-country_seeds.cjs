"use strict";

const BALI_AREAS = [
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

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM country",
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (Number(existing[0]?.count || 0) > 0) {
      return;
    }

    const rows = BALI_AREAS.map((name) => ({
      name,
      slug: slugify(name),
      createdAt: new Date(),
      updatedAt: new Date(),
      timezone: "Asia/Makassar",
    }));

    await queryInterface.bulkInsert("country", rows, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await queryInterface.bulkDelete("country", null, {});
    await queryInterface.sequelize.query("ALTER TABLE country AUTO_INCREMENT = 1");
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
