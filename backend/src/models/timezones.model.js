export default (sequelize, DataTypes) => {
  const Timezones = sequelize.define(
    "Timezones",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      timezone_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      utc_offset: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "timezones",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  )

  return Timezones
}