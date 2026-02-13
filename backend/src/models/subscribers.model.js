export default (sequelize, DataTypes) => {
  const Subscribers = sequelize.define(
    "Subscribers",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        refrence: {
          model: "subscription_status",
          key: "code",
        },
      },
      subscribed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      unsubscribed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "subscribers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Subscribers.associate = (models) => {
    Subscribers.belongsTo(models.SubscriptionStatus, {
      foreignKey: "status",
      targetKey: "code",
      as: "status_subscription",
    });
  };

  return Subscribers;
};
