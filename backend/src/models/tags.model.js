export default (sequelize, DataTypes) => {
  const Tags = sequelize.define(
    "Tags",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      icon: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "tags",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  Tags.associate = (models) => {
    // Relasi ke asset_media (icon)
    Tags.belongsTo(models.AssetMedia, {
      foreignKey: "icon",
      as: "asset",
    });

    // Relasi ke Users (createdBy & updatedBy)
    Tags.belongsTo(models.User, { foreignKey: "createdBy", as: "creator" });
    Tags.belongsTo(models.User, { foreignKey: "updatedBy", as: "updater" });

    Tags.belongsToMany(models.Category, {
      through: models.TagCategory,
      foreignKey: "id_tag",
      otherKey: "id_category",
      as: "categories",
    });

    // Kalau nanti mau bikin pivot untuk article_tags
    // Tags.belongsToMany(models.Article, {
    //   through: "article_tags",
    //   foreignKey: "tag_id",
    //   otherKey: "article_id",
    // });
  };

  return Tags;
};
