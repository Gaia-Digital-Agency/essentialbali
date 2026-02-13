export default (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      sub_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      slug_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_child: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      id_parent: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      template_name: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "category",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  Category.associate = (models) => {
    // Category.hasMany(models.Article, { foreignKey: "category" });
    Category.belongsTo(models.Category, {
      foreignKey: "id_parent",
      as: "parent",
    });

    Category.belongsTo(models.User, { foreignKey: "createdBy" });
    Category.belongsTo(models.User, { foreignKey: "updatedBy" });

    Category.hasMany(models.Articles, { foreignKey: "category" });
    Category.hasMany(models.Articles, { foreignKey: "parent_category_id" });

    Category.hasMany(models.CategoryDescription, {
      foreignKey: "category_id",
      as: "descriptions",
    });

    Category.belongsToMany(models.Tags, {
      through: models.TagCategory,
      foreignKey: "id_category",
      otherKey: "id_tag",
      as: "tags",
    });
  };

  return Category;
};
