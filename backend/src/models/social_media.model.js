export default (sequelize, DataTypes) => {
  const SocialMedia = sequelize.define(
    "SocialMedia",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      platform: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      icon: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "social_media",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  SocialMedia.associate = (models) => {
    // Relasi ke asset_media (icon)
    SocialMedia.belongsTo(models.AssetMedia, {
      foreignKey: "icon",
      as: "asset",
    });

    // Relasi ke Users (createdBy & updatedBy)
    SocialMedia.belongsTo(models.User, { foreignKey: "createdBy", as: "creator" });
    SocialMedia.belongsTo(models.User, { foreignKey: "updatedBy", as: "updater" });

    // Kalau nanti mau bikin pivot untuk article_tags
    // Tags.belongsToMany(models.Article, {
    //   through: "article_tags",
    //   foreignKey: "tag_id",
    //   otherKey: "article_id",
    // });
  };

  return SocialMedia;
};
