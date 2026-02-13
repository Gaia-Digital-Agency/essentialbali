// models/Location.js
"use strict";
export default (sequelize, DataTypes) => {
  const PropertyLocation = sequelize.define(
    "PropertyLocation",
    {
      city: DataTypes.STRING,
      region: DataTypes.STRING,
      country: DataTypes.STRING,
    },
    {
      tableName: "property_location",
      underscored: true,
      timestamps: false,
    }
  );

  PropertyLocation.associate = function (models) {
    PropertyLocation.hasMany(models.Property, { foreignKey: "location_id" });
  };

  return PropertyLocation;
};
