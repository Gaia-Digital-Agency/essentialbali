export default (sequelize, DataTypes) => {
  const City = sequelize.define(
    "City",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_country: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      site_logo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      tableName: "city",
      timestamps: true,
    }
  );

  City.associate = (models) => {
    City.belongsTo(models.Country, {
      foreignKey: "id_country",
      as: "country",
    });

    City.hasMany(models.Region, {
      foreignKey: "id_city",
      as: "regions",
    });

    City.belongsTo(models.AssetMedia, {
      foreignKey: "site_logo",
      as: "asset",
    });

    City.hasMany(models.User, { foreignKey: "id_city" });
    // City.hasMany(models.Article, { foreignKey: "id_city" });
    City.hasMany(models.Articles, { foreignKey: "id_city" });
    City.hasMany(models.Property, { foreignKey: "id_city" });
    City.hasMany(models.CategoryDescription, {
      foreignKey: "id_city",
      as: "category_descriptions",
    });
  };

  return City;
};
