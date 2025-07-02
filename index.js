import express from "express";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import bodyparser from "body-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import db from "./config/db.js";
import { cookie } from "express-validator";

// crear app
const app = express();

//Habilitar Cookie Parser
app.use(cookieParser());

//Habilitar CSRF  -- Se habilita de forma global en la aplicacion al usar app.use
let csrfProtection = csrf({ cookie: true });

// conexion a la base de datos
try {
  await db.authenticate();
  db.sync();
  console.log("conexion correcta a la base de datos");
} catch (error) {
  console.log(error);
}

// Carpeta Publica

app.use(express.static("public")); // instruccion que se usa para indicar donde se encuantran los archivos estaticos (CSS)

// habilitar lectura de datos provenientes de un formulario
app.use(express.urlencoded({ extended: true }));

// Habilitar Pug

app.set("view engine", "pug");
app.set("views", "./views");

// Routing

app.use("/auth", csrfProtection, usuarioRoutes);

app.use("/", csrfProtection, propiedadesRoutes);

app.use("/", appRoutes);

app.use("/api", apiRoutes);

// definir un puerto y arrancar el servidor

const port = process.env.BACKEND_PORT || 3000;
app.listen(port, () => {
  console.log(`El servidor esta escuchando en el puerto ${port}`);
});
