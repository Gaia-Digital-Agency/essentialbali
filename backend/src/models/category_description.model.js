export default (sequelize, DataTypes) => {
  const CategoryDescription = sequelize.define(
    "CategoryDescription",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_country: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_city: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_region: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sub_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
    },
    {
      tableName: "category_description",
      timestamps: true, // sesuai migration (ada createdAt & updatedAt)
    }
  );

  CategoryDescription.associate = (models) => {
    CategoryDescription.belongsTo(models.Country, {
      foreignKey: "id_country",
      as: "country",
    });
    CategoryDescription.belongsTo(models.City, {
      foreignKey: "id_city",
      as: "city",
    });
    CategoryDescription.belongsTo(models.Region, {
      foreignKey: "id_region",
      as: "region",
    });
    CategoryDescription.belongsTo(models.Category, {
      foreignKey: "category_id",
      as: "category",
    });
  };

  return CategoryDescription;
};
