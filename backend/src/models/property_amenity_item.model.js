"use strict";
export default (sequelize, DataTypes) => {
  const PropertyAmenityItem = sequelize.define(
    "PropertyAmenityItem",
    {
      name: DataTypes.STRING,
      icon: DataTypes.INTEGER,
    },
    {
      tableName: "property_amenity_item",
      underscored: true,
      timestamps: false,
    }
  );

  PropertyAmenityItem.associate = function (models) {
    PropertyAmenityItem.belongsToMany(models.Property, {
      through: models.PropertyAmenity,
      foreignKey: "amenity_id",
    });

    PropertyAmenityItem.belongsTo(models.AssetMedia, {
      foreignKey: "icon",
      as: "iconMedia",
    });
  };

  return PropertyAmenityItem;
};
