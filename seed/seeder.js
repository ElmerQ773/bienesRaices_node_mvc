import { exit } from "node:process";
import categorias from "./categorias.js"; // estos son los datos
import precios from "./precios.js";
import usuarios from "./usuario.js";
import db from "../config/db.js"; //  instancia de conexion a la base de datos
import { Categoria, Precio, Usuario } from "../models/index.js";

const importarDatos = async () => {
  try {
    // Autenticar en la Base de Datos
    await db.authenticate();

    // Generar las Columnas
    await db.sync();

    // Insertamos los datos

    // await Categoria.bulkCreate(categorias);   si se tiene doble await y el segundo no depende del primero(son procesos independientes) se recomienda utilizar promise.all
    // await Precio.bulkCreate(precios);

    await Promise.all([
      Categoria.bulkCreate(categorias),
      Precio.bulkCreate(precios),
      Usuario.bulkCreate(usuarios),
    ]);

    console.log("Datos Importados Correctamente");

    exit(); // se escribe exit() o exit(0) para finalizar procesos cuando no hubo errores
  } catch (error) {
    console.log(error);
    exit(1); // se escribe exit(1) para finalizar procesos cuando hubo un error
  }
};

const eliminarDatos = async () => {
  try {
    // await Promise.all([
    //  Categoria.destroy({ where: {}, truncate: true }),  el objeto vacio borra la data, el truncate hace que el id no sea consecutivo sino que tambien elimina el registro de los id asignados previamente
    //  Precio.destroy({ where: {}, truncate: true }),

    await db.sync({ force: true }); // otra formade limpiar las tablas, este comando aplica un DROP a las tablas y luego las vuelve a crear
    console.log("Datos eliminados correctamente"), exit(0);
  } catch (error) {
    console.log(error);
    exit(1);
  }
};

if (process.argv[2] === "-i") {
  importarDatos();
}

if (process.argv[2] === "-e") {
  eliminarDatos();
}
