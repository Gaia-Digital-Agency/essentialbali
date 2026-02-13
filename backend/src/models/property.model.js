// models/Property.js
export default (sequelize, DataTypes) => {
  const Property = sequelize.define(
    "Property",
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      type: DataTypes.STRING,
      bedrooms: DataTypes.INTEGER,
      bathrooms: DataTypes.INTEGER,
      capacity: DataTypes.INTEGER,
      location_id: DataTypes.INTEGER,
      price_daily: DataTypes.BIGINT,
      price_monthly: DataTypes.BIGINT,
      price_yearly: DataTypes.BIGINT,
      created_by: DataTypes.STRING,
      updated_by: DataTypes.STRING,
      status: DataTypes.ENUM("available", "booked", "maintenance"),
      id_country: DataTypes.INTEGER,
      id_city: DataTypes.INTEGER,
      id_region: DataTypes.INTEGER
    },
    {
      tableName: "property",
      underscored: true,
    }
  );

  Property.associate = function (models) {
    // Property.belongsTo(models.Region, {
    //   foreignKey: "location_id",
    //   as: "region",
    // });

    Property.belongsTo(models.Region, {
      foreignKey: "location_id",
      as: "property_location", // penting! kasih alias biar jelas
    });

    Property.belongsTo(models.Country, { foreignKey: "id_country" });
    Property.belongsTo(models.City, { foreignKey: "id_city" });
    Property.belongsTo(models.Region, { foreignKey: "id_region" });


    Property.hasMany(models.PropertyImage, { foreignKey: "property_id" });

    Property.belongsToMany(models.PropertyAmenityItem, {
      through: models.PropertyAmenity, // harus ada model ini
      foreignKey: "property_id",
      otherKey: "amenity_id",
      as: "amenity",
    });
  };

  return Property;
};
