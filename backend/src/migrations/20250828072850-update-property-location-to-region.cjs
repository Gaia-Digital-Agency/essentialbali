"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hapus FK lama
    await queryInterface.removeConstraint("property", "property_ibfk_1");

    // Tambahkan FK baru ke region
    await queryInterface.addConstraint("property", {
      fields: ["location_id"],
      type: "foreign key",
      name: "fk_property_region",
      references: {
        table: "region",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // rollback ke FK lama (property_location)
    await queryInterface.removeConstraint("property", "fk_property_region");

    await queryInterface.addConstraint("property", {
      fields: ["location_id"],
      type: "foreign key",
      name: "property_ibfk_1",
      references: {
        table: "property_location",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
