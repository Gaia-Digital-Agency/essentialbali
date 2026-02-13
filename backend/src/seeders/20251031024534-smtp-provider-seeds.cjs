"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM smtp_providers",
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (Number(existing[0]?.count || 0) > 0) {
      return;
    }

    const now = new Date();
    await queryInterface.bulkInsert("smtp_providers", [
      { provider_name: "Gmail", host: "smtp.gmail.com", port: 465, secure: true, created_at: now, updated_at: now },
      { provider_name: "Outlook", host: "smtp.office365.com", port: 587, secure: false, created_at: now, updated_at: now },
      { provider_name: "Yahoo", host: "smtp.mail.yahoo.com", port: 465, secure: true, created_at: now, updated_at: now },
      { provider_name: "Zoho", host: "smtp.zoho.com", port: 465, secure: true, created_at: now, updated_at: now },
      { provider_name: "SendGrid", host: "smtp.sendgrid.net", port: 587, secure: false, created_at: now, updated_at: now },
      { provider_name: "Mailgun", host: "smtp.mailgun.org", port: 587, secure: false, created_at: now, updated_at: now },
      { provider_name: "Amazon SES", host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false, created_at: now, updated_at: now },
      { provider_name: "Postmark", host: "smtp.postmarkapp.com", port: 587, secure: false, created_at: now, updated_at: now },
      { provider_name: "Brevo", host: "smtp-relay.brevo.com", port: 587, secure: false, created_at: now, updated_at: now },
      { provider_name: "Mailjet", host: "in-v3.mailjet.com", port: 587, secure: false, created_at: now, updated_at: now },
      { provider_name: "Elastic Email", host: "smtp.elasticemail.com", port: 2525, secure: false, created_at: now, updated_at: now },
      { provider_name: "SMTP.com", host: "smtp.smtp.com", port: 587, secure: false, created_at: now, updated_at: now },
      { provider_name: "Custom", host: "", port: 587, secure: false, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("smtp_providers", null, {});
  },
};
