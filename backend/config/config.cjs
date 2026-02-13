require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "dsKqGW0nA6sEwJK59rZk",
    database: process.env.DATABASE || "essentialbali",
    host: "127.0.0.1",
    port: 3306,
    dialect: "mysql",
    logging: false,
    timezone: "+07:00",
    dialectOptions: {
      charset: "utf8mb4",
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
  },
  production: {
    username: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "dsKqGW0nA6sEwJK59rZk",
    database: process.env.DATABASE_PRODUCTION || "essentialbali",
    host: "127.0.0.1",
    port: 3306,
    dialect: "mysql",
    logging: false,
    timezone: "+07:00",
    dialectOptions: {
      charset: "utf8mb4",
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
  },
};
