export default (sequelize, DataTypes) => {
  const AuthSession = sequelize.define(
    "AuthSession",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isRevoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "auth_session",
      timestamps: true,
    }
  );

  // Associations

  AuthSession.associate = (models) => {
    AuthSession.belongsTo(models.User, { foreignKey: "userId" });
  };

  return AuthSession;
};
