export default (sequelize, DataTypes) => {
  const SMTPProvider = sequelize.define(
    "SMTPProvider",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      provider_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      host: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      port: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 587,
      },
      secure: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "smtp_providers",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return SMTPProvider;
};
