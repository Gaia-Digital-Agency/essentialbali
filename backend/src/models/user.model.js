export default (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    token: {
      type: DataTypes.TEXT,
    },
    id_country: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_city: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_level: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_picture_original_name: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  // relasi kalau ada
  User.associate = (models) => {
    User.hasMany(models.AuthSession, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });

    // User belongs to Country
    User.belongsTo(models.Country, { foreignKey: "id_country" , as: "country"});

    // User belongs to City
    User.belongsTo(models.City, { foreignKey: "id_city", as: "city" });

    User.hasMany(models.ArticleTemplating, { foreignKey: "createdBy" });
    User.hasMany(models.ArticleTemplating, { foreignKey: "updatedBy" });
  };

  return User;
};
