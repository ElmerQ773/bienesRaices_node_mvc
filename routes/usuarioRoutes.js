import express from "express";
import {
  formularioLogin,
  autenticarUsuario,
  cerrarSesion,
  formularioRecuperarPassword,
  formularioRegister,
  registrarUsuario,
  confirmarCuenta,
  resetPassword,
  comprobarToken,
  nuevoPassword,
} from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/login", formularioLogin);
router.post("/login", autenticarUsuario);

router.get("/register", formularioRegister);
router.post("/register", registrarUsuario);

//Cerrar Sesion
router.post("/cerrar-sesion", cerrarSesion);

router.get("/confirmarCuenta/:token", confirmarCuenta);

router.get("/recuperarPassword", formularioRecuperarPassword);
router.post("/recuperarPassword", resetPassword);

//Almacena el nuevo password
router.get("/recuperarPassword/:token", comprobarToken);
router.post("/recuperarPassword/:token", nuevoPassword);

export default router; // la funcion router se exporta por defecto al importar desde usuario routes
