import { Sequelize } from "sequelize";
import configFile from "./config.js"; // config/config.js kamu
import "dotenv/config";

const env = process.env.NODE_ENV || "development";
const config = configFile[env]; // ambil konfigurasi sesuai env

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    timezone: config.timezone,
    pool: config.pool,
    dialectOptions: config.dialectOptions,
  }
);

export default sequelize;
