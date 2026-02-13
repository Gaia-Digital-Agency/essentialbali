export default (sequelize, DataTypes) => {
  const ArticleTemplating = sequelize.define(
    "ArticleTemplating",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      template: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "article_templating",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  ArticleTemplating.associate = (models) => {
    ArticleTemplating.belongsTo(models.User, { foreignKey: "createdBy" });
    ArticleTemplating.belongsTo(models.User, { foreignKey: "updatedBy" });
  };

  return ArticleTemplating;
};
