export default (sequelize, DataTypes) => {
  const ArticlePointScoring = sequelize.define(
    "ArticlePointScoring",
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
      point: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "article_point_scoring",
      timestamps: true,
    }
  );
  return ArticlePointScoring;
};
