import jwt from "jsonwebtoken";

//Generar JWT
const generarJWT = (datos) =>
  jwt.sign({ id: datos.id, nombre: datos.nombre }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

//Genera un token para confirmar que se almacena en la BD para luego confirmar la cuenta
const generarId = () =>
  Math.random().toString(32).substring(2) + Date.now().toString(32);

export { generarId, generarJWT };
