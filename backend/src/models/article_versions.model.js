// models/article_version.js
export default (sequelize, DataTypes) => {
  const ArticleVersion = sequelize.define(
    "ArticleVersion",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "articles",
          key: "id",
        },
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
        comment: "Custom data per category, e.g. housing/job fields",
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "pending",
          "published",
          "archived",
          "rejected",
          "scheduled"
        ),
        defaultValue: "draft",
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "article_versions",
      timestamps: false,
    }
  );

  ArticleVersion.associate = (models) => {
    ArticleVersion.belongsTo(models.Articles, {
      foreignKey: "article_id",
      as: "article",
    });

    ArticleVersion.belongsTo(models.AssetMedia, {
      foreignKey: "featured_image",
      as: "featuredImage",
    });

    ArticleVersion.belongsTo(models.User, { foreignKey: "createdBy" });
    ArticleVersion.belongsTo(models.User, { foreignKey: "updatedBy" });

    ArticleVersion.belongsTo(models.AssetMedia, {
      foreignKey: "featured_image_4_3",
      as: "featuredImage43",
    });

    ArticleVersion.belongsTo(models.AssetMedia, {
      foreignKey: "featured_image_16_9",
      as: "featuredImage169",
    });
  };

  return ArticleVersion;
};
