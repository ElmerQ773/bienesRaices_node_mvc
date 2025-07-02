import jwt from "jsonwebtoken";
import { Usuario } from "../models/index.js";

const protegerRuta = async (req, res, next) => {
  // Verificar si hay un token
  const { _token } = req.cookies;
  if (!_token) {
    return res.redirect("/auth/login");
  }
  // Comprobar el token
  try {
    const decoded = jwt.verify(_token, process.env.JWT_SECRET);
    const usuario = await Usuario.scope("eliminarCampos").findByPk(decoded.id); // objeto usuario obtenido del modelo Usuario desde la BD

    //Almacenar el usuario al req
    if (usuario) {
      req.usuario = usuario; // se almacena obj usuario en req.usuario para que este disponible donde usemos req
    } else {
      return res.redirect("/auth/login");
    }

    return next();
  } catch (error) {
    return res.clearCookie("_token").redirect("/auth/login");
  }
};

export default protegerRuta;
