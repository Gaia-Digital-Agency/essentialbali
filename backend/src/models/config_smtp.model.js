import { encrypt } from "../helpers/crypto.js";

export default (sequelize, DataTypes) => {
  const ConfigSMTP = sequelize.define(
    "ConfigSMTP",
    {
      provider_name: DataTypes.STRING,
      host: DataTypes.STRING,
      port: DataTypes.INTEGER,
      secure: DataTypes.BOOLEAN,
      username: DataTypes.STRING,
      password: DataTypes.TEXT,
      from_name: DataTypes.STRING,
      from_email: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
    },
    {
      tableName: "config_smtp",
      underscored: true,
      hooks: {
        beforeCreate: (setting) => {
          if (setting.password) setting.password = encrypt(setting.password);
        },
        beforeUpdate: (setting) => {
          if (setting.changed("password")) {
            console.log("Masuk siap2 edit ==> ", setting.password);
            setting.password = encrypt(setting.password);
          }
        },
        beforeUpsert: (setting) => {
          if (setting.password) {
            console.log("Masuk siap2 edit (UPSERT) ==> ", setting.password);
            setting.password = encrypt(setting.password);
          }
        },
      },
    }
  );

  // ConfigSMTP.associate = (models) => {
  //   ConfigSMTP.belongsTo(models.SMTPProvider, {
  //     foreignKey: "id_smtp_provider",
  //     as: "provider",
  //   })
  // };

  return ConfigSMTP;
};
