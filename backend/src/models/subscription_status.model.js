export default (sequelize, DataTypes) => {
  const SubscriptionStatus = sequelize.define(
    "SubscriptionStatus",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code : {
        type: DataTypes.TINYINT,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      }
    },
    {
      tableName: "subscription_status",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return SubscriptionStatus;
};
