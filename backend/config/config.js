import dotenv from "dotenv";
dotenv.config();

// Check if using Cloud SQL socket path
const dbHost = process.env.DATABASE_HOST || "127.0.0.1";
const isCloudSQL = dbHost.startsWith('/cloudsql/');

const common = {
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: isCloudSQL ? undefined : dbHost,
  dialect: "mysql",
  pool: {
    max: Number(process.env.DB_POOL_MAX || 10),
    min: Number(process.env.DB_POOL_MIN || 0),
    idle: Number(process.env.DB_POOL_IDLE || 10000),
    acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
  },
  logging: false,
  timezone: process.env.DB_TIMEZONE || "+07:00",
  dialectOptions: {
    charset: "utf8mb4",
    ...(isCloudSQL && { socketPath: dbHost }),
  },
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
};

export default {
  development: {
    ...common,
    database: process.env.DATABASE,
  },
  production: {
    ...common,
    database: process.env.DATABASE_PRODUCTION,
  },
  test: {
    ...common,
    database: process.env.DATABASE_TEST,
  },
};
