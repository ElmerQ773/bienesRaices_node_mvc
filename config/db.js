import sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// instacia creda de sequelize acepta 4 parametros: nombre de la base de datos, usuario, contrseña, y un objeto de configuracion
const db = new sequelize(
  process.env.BD_NOMBRE,
  process.env.BD_USUARIO,
  process.env.BD_PASSWORD,
  {
    host: process.env.BD_HOST,
    port: process.env.BD_PORT,
    dialect: "mysql",
    define: {
      timestamps: true,
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    operatorAliases: false,
  }
);

export default db;
