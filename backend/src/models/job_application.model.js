export default (sequelize, DataTypes) => {
  const JobApplication = sequelize.define(
    "JobApplication",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      id_article: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "articles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      applicant_email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone : {
        type: DataTypes.STRING,
        allowNull: true,
      },
      file: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "job_application",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  JobApplication.associate = (models) => {
    JobApplication.belongsTo(models.Articles, {
      foreignKey: "id_article",
      as: "article",
    });
  };

  return JobApplication;
};
