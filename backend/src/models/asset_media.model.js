export default (sequelize, DataTypes) => {
  const AssetMedia = sequelize.define(
    "AssetMedia",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alt_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      filename: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mimetype: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      path: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "asset_media",
      timestamps: true, // Sequelize otomatis buat createdAt & updatedAt
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  AssetMedia.associate = (models) => {
    AssetMedia.hasMany(models.Tags, {
      foreignKey: "icon",
      as: "tags", // biar bisa akses assetMedia.tags
    });

    AssetMedia.hasMany(models.SocialMedia, {
      foreignKey: "icon",
      as: "socialMedia",
    });

    AssetMedia.hasMany(models.PropertyAmenityItem, {
      foreignKey: "icon",
      as: "amenityItems",
    });

    AssetMedia.belongsTo(models.User, { foreignKey: "createdBy" });
    AssetMedia.belongsTo(models.User, { foreignKey: "updatedBy" });


    AssetMedia.hasMany(models.ArticleVersion, {
      foreignKey: "featured_image",
      as: "featuredImage",
    });

    AssetMedia.hasMany(models.ArticleVersion, {
      foreignKey: "featured_image_4_3",
      as: "featuredImage43",
    });

    AssetMedia.hasMany(models.ArticleVersion, {
      foreignKey: "featured_image_16_9",
      as: "featuredImage169",
    });


    AssetMedia.hasMany(models.Articles, {
      foreignKey: "featured_image",
      as: "articles",
    });

    AssetMedia.hasMany(models.Articles, {
      foreignKey: "featured_image_4_3",
      as: "articles43",
    });

    AssetMedia.hasMany(models.Articles, {
      foreignKey: "featured_image_16_9",
      as: "articles169",
    });

    AssetMedia.hasMany(models.Country, {
      foreignKey: "site_logo",
      sourceKey: "id",
      as: "country",
    });

    AssetMedia.hasMany(models.Country, {
      foreignKey: "flag_icon",
      sourceKey: "id",
      as: "flagIcon",
    });
  };
  return AssetMedia;
};
