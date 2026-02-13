"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const countryRows = await queryInterface.sequelize.query(
      "SELECT id FROM country ORDER BY id ASC LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const cityRows = await queryInterface.sequelize.query(
      "SELECT id FROM city ORDER BY id ASC LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const idCountry = countryRows[0]?.id ?? null;
    const idCity = cityRows[0]?.id ?? null;
    const now = new Date();

    const users = [
      {
        name: "Super Admin",
        email: "super_admin@admin.com",
        password:
          "$2b$10$Vu1Ctw/UpsrhB/u3qWqcM.ECGOR55z1nBTQ/zqm0DxMjC0i.Aad4S",
        isActive: 1,
        user_level: "super_admin",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Admin Canggu",
        email: "canggu@admin.com",
        password:
          "$2b$10$Vu1Ctw/UpsrhB/u3qWqcM.ECGOR55z1nBTQ/zqm0DxMjC0i.Aad4S",
        isActive: 1,
        user_level: "admin_country",
        id_country: idCountry,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Admin Bali",
        email: "bali@admin.com",
        password:
          "$2b$10$Vu1Ctw/UpsrhB/u3qWqcM.ECGOR55z1nBTQ/zqm0DxMjC0i.Aad4S",
        isActive: 1,
        user_level: "admin_city",
        id_country: idCountry,
        id_city: idCity,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const user of users) {
      const existing = await queryInterface.sequelize.query(
        "SELECT id FROM Users WHERE email = :email LIMIT 1",
        {
          replacements: { email: user.email },
          type: Sequelize.QueryTypes.SELECT,
        }
      );
      if (existing.length) {
        await queryInterface.bulkUpdate(
          "Users",
          {
            name: user.name,
            password: user.password,
            isActive: user.isActive,
            user_level: user.user_level,
            id_country: user.id_country ?? null,
            id_city: user.id_city ?? null,
            updatedAt: now,
          },
          { id: existing[0].id }
        );
      } else {
        await queryInterface.bulkInsert("Users", [user], {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await queryInterface.bulkDelete("Users", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE Users AUTO_INCREMENT = 1"
    );
    
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
