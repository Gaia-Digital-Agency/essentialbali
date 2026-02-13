export default (sequelize, DataTypes) => {
  const TagCategory = sequelize.define(
    "TagCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_category: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_tag: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "tag_category",
      underscored: true,
    }
  );

  TagCategory.associate = (models) => {
    TagCategory.belongsTo(models.Category, {
      foreignKey: "id_category",
      targetKey: "id",
      as: "category",
    });

    TagCategory.belongsTo(models.Tags, {
      foreignKey: "id_tag",
      targetKey: "id",
      as: "tag",
    });
  };

  return TagCategory;
};
