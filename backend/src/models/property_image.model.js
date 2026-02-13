export default (sequelize, DataTypes) => {
  const PropertyImage = sequelize.define(
    "PropertyImage",
    {
      property_id: DataTypes.INTEGER,
      image_url: DataTypes.STRING,
      is_primary: DataTypes.BOOLEAN,
    },
    {
      tableName: "property_image",
      underscored: true,
      timestamps: false,
    }
  );

  PropertyImage.associate = function (models) {
    PropertyImage.belongsTo(models.Property, { foreignKey: "property_id" });
  };

  return PropertyImage;
};
