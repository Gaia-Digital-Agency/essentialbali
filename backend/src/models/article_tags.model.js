export default (sequelize, DataTypes) => {
  const ArticleTags = sequelize.define(
    "ArticleTags",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_article: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "articles",
          key: "id",
        },
      },
      id_tag: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tags",
          key: "id",
        },
      },
    },
    {
      tableName: "article_tags",
      timestamps: false,
    }
  );

  ArticleTags.associate = (models) => {
    ArticleTags.belongsTo(models.Articles, {
      foreignKey: "id_article",
      as: "article",
    });

    ArticleTags.belongsTo(models.Tags, {
      foreignKey: "id_tag",
      as: "tag",
    });
  };

  return ArticleTags;
};
