import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};
const basename = path.basename(__filename);

const modelFiles = fs.readdirSync(__dirname).filter(
  (file) =>
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.endsWith(".model.js") // pastikan filter sesuai naming convention
);

for (const file of modelFiles) {
  const modelModule = await import(path.join(__dirname, file));
  const model = modelModule.default(sequelize, DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
