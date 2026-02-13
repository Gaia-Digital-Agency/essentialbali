export default (sequelize, DataTypes) => {
  const Region = sequelize.define(
    "Region",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_city: {
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
      tableName: "region",
      timestamps: true,
    }
  );

  Region.associate = (models) => {
    // Region belongs to City
    Region.belongsTo(models.City, {
      foreignKey: "id_city",
      as: "city",
    });

    Region.belongsTo(models.AssetMedia, {
      foreignKey: "site_logo",
      as: "asset",
    });

    // Region.hasMany(models.Article, { foreignKey: "id_region" });
    Region.hasMany(models.Articles, { foreignKey: "id_region" });
    Region.hasMany(models.Property, { foreignKey: "id_region" });
    Region.hasMany(models.Property, {
      foreignKey: "location_id",
      as: "properties",
    });
    Region.hasMany(models.CategoryDescription, {
      foreignKey: "id_region",
      as: "category_descriptions",
    });
  };

  return Region;
};
