"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("category_description", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_country: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "country", // ganti sesuai nama tabel country kamu
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_city: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "city", // ganti sesuai nama tabel city kamu
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_region: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "region", // ganti sesuai nama tabel region kamu
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "category", // ganti sesuai nama tabel category kamu
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      sub_title: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // 🔹 Index utama untuk query fallback (composite index)
    await queryInterface.addIndex(
      "category_description",
      ["category_id", "id_country", "id_city", "id_region"],
      {
        name: "idx_category_desc_composite",
      }
    );

    // 🔹 Index tambahan untuk optimasi join
    await queryInterface.addIndex("category_description", ["id_country"], {
      name: "idx_category_desc_country",
    });
    await queryInterface.addIndex("category_description", ["id_city"], {
      name: "idx_category_desc_city",
    });
    await queryInterface.addIndex("category_description", ["id_region"], {
      name: "idx_category_desc_region",
    });
    await queryInterface.addIndex("category_description", ["category_id"], {
      name: "idx_category_desc_category",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("category_description");
  },
};
