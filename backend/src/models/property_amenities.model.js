// models/PropertyAmenity.js
"use strict";
export default (sequelize, DataTypes) => {
  const PropertyAmenity = sequelize.define(
    "PropertyAmenity",
    {
      property_id: DataTypes.INTEGER,
      amenity_id: DataTypes.INTEGER,
    },
    {
      tableName: "property_amenities",
      underscored: true,
      timestamps: false,
    }
  );

  return PropertyAmenity;
};
