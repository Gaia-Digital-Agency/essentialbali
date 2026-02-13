"use strict";

module.exports = {
  
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("config_smtp", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      provider_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Misal: Gmail, Outlook, Custom SMTP",
      },
      host: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "Host server (misal: smtp.gmail.com)",
      },
      port: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 587,
        comment: "Port (misal: 465 / 587)",
      },
      secure: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "true jika SSL",
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "SMTP username",
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "SMTP password (encrypted)",
      },
      from_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "Nama pengirim",
      },
      from_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "Email pengirim",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Apakah setting ini aktif",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
        comment: "Waktu dibuat",
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
        comment: "Terakhir diubah",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("config_smtp");
  },

};
