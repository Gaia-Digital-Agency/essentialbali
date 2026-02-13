// models/article.js
export default (sequelize, DataTypes) => {
  const Articles = sequelize.define(
    "Articles",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      slug_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sub_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      article_post: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      featured_image: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "asset_media",
          key: "id",
        },
      },
      featured_image_4_3: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "asset_media",
          key: "id",
        },
      },
      featured_image_16_9: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "asset_media",
          key: "id",
        },
      },
      meta_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "pending",
          "published",
          "archived",
          "rejected",
          "scheduled",
          "bin"
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      author: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      category: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "category",
          key: "id",
        },
      },
      parent_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "category",
          key: "id",
        },
      },
      id_country: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "country",
          key: "id",
        },
      },
      id_city: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "city",
          key: "id",
        },
      },
      id_region: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "region",
          key: "id",
        },
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      publishedby: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      current_version_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "article_versions",
          key: "id",
        },
      },
      pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "articles",
      timestamps: false,
    }
  );

  Articles.associate = (models) => {
    Articles.hasMany(models.ArticleVersion, {
      foreignKey: "article_id",
      as: "versions",
    });

    Articles.belongsTo(models.ArticleVersion, {
      foreignKey: "current_version_id",
      as: "currentVersion",
    });

    Articles.belongsTo(models.AssetMedia, {
      foreignKey: "featured_image",
      as: "featuredImage",
    });

    Articles.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "createdByUser",
    });

    Articles.belongsTo(models.User, {
      foreignKey: "updatedBy",
      as: "updatedByUser",
    });

    Articles.belongsTo(models.User, {
      foreignKey: "publishedby",
      as: "publishedByUser",
    });

    Articles.belongsTo(models.Category, { foreignKey: "category" });
    Articles.belongsTo(models.Category, { foreignKey: "parent_category_id" });

    Articles.belongsTo(models.Country, { foreignKey: "id_country" });
    Articles.belongsTo(models.City, { foreignKey: "id_city" });
    Articles.belongsTo(models.Region, { foreignKey: "id_region" });

    Articles.belongsTo(models.AssetMedia, {
      foreignKey: "featured_image_4_3",
      as: "featuredImage43",
    });

    Articles.belongsTo(models.AssetMedia, {
      foreignKey: "featured_image_16_9",
      as: "featuredImage169",
    });
  };

  return Articles;
};
