"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("subscribers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: "Subscriber email address",
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "FK to subscription_status.code",
      },
      subscribed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Timestamp when user subscribed",
      },
      unsubscribed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Timestamp when user unsubscribed",
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: "IP address of subscriber (supports IPv6)",
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Browser user agent for analytics",
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "Source of subscription: homepage, footer, popup, etc",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex("subscribers", ["email"], {
      name: "idx_subscribers_email",
      unique: true,
    });

    await queryInterface.addIndex("subscribers", ["status"], {
      name: "idx_subscribers_status",
    });

    await queryInterface.addIndex("subscribers", ["created_at"], {
      name: "idx_subscribers_created_at",
    });

    // Add foreign key constraint
    await queryInterface.addConstraint("subscribers", {
      fields: ["status"],
      type: "foreign key",
      name: "fk_subscribers_status",
      references: {
        table: "subscription_status",
        field: "code",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("subscribers");
  },
};
