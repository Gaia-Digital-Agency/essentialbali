export default (sequelize, DataTypes) => {
  const Country = sequelize.define(
    "Country",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flag_icon : {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      timezone : {
        type: DataTypes.STRING,
        allowNull: true,
      },
      site_logo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      tableName: "country",
      timestamps: true,
    }
  );

  Country.associate = (models) => {
    Country.hasMany(models.City, {
      foreignKey: "id_country",
      as: "cities",
    });

    Country.belongsTo(models.AssetMedia, {
      foreignKey: "site_logo",
      as: "asset",
    });

    Country.belongsTo(models.AssetMedia, {
      foreignKey: "flag_icon",
      as: "flagIcon",
    });

    Country.hasMany(models.User, { foreignKey: "id_country" });
    // Country.hasMany(models.Article, { foreignKey: "id_country" });
    Country.hasMany(models.Articles, { foreignKey: "id_country" });
    Country.hasMany(models.Property, { foreignKey: "id_country" });
    Country.hasMany(models.CategoryDescription, {
      foreignKey: "id_country",
      as: "category_descriptions",
    });
  };

  return Country;
};
