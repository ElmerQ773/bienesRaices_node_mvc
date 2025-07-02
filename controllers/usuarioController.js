import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import { generarId, generarJWT } from "../helpers/token.js";
import { emailDeRegistro, emailOlvidePassword } from "../helpers/emails.js";

// formulario login

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar Sesion",
    csrfToken: req.csrfToken(),
  });
};

// Autenticacion de usuario
const autenticarUsuario = async (req, res) => {
  //Validacion
  await check("email")
    .isEmail()
    .withMessage("El Email es obligatorio")
    .run(req);

  await check("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .run(req);

  let resultado = validationResult(req); // almacena el resultado de las validaciones en la variable resultado utilizando la funcion validationResult
  console.log(req.body);
  // verificar que no existan erroes para proceder a crear el usuario
  if (!resultado.isEmpty()) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      errores: resultado.array(), // responde un array con el resultado de las validaciones
      csrfToken: req.csrfToken(),
    });
  }

  const { email, password } = req.body;

  // comprobar si el usuario existe
  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      errores: [{ msg: "El Usuario No Existe" }],
      csrfToken: req.csrfToken(),
    });
  }

  // Comprobar si el Usuario esta confirmado
  if (!usuario.confirmado) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      errores: [{ msg: "Aun no ha confirmado su cuenta" }],
      csrfToken: req.csrfToken(),
    });
  }

  // verificar contraseña
  if (!usuario.verificarPassword(password)) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      errores: [{ msg: "El password es incorrecto" }],
      csrfToken: req.csrfToken(),
    });
  }

  //autenticar al usuario
  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });
  console.log(token);

  //Almacenar en un cookie
  return res
    .cookie("_token", token, {
      httpOnly: true,
      //secure: true
      //sameSite: true
    })
    .redirect("/mis-propiedades");
};

// CERRAR SESION

const cerrarSesion = async (req, res) => {
  return res.clearCookie("_token").status(200).redirect("/auth/login");
};

// FORMULARIO REGISTRO

const formularioRegister = (req, res) => {
  res.render("auth/register", {
    pagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

const registrarUsuario = async (req, res) => {
  //Validacion
  await check("nombre") //check campo nombre
    .notEmpty() // no puede ir vacio
    .withMessage("El Nombre es Obligatorio") // mensaje de error si se deja vacio
    .run(req); // run function on request

  await check("email").isEmail().withMessage("Eso no parece un email").run(req);

  await check("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe contener al menos 8 caracteres")
    .run(req);

  await check("repetir_password")
    .equals(req.body.password)
    .withMessage("La contraseña no coincide")
    .run(req);

  let resultado = validationResult(req); // almacena el resultado de las validaciones en la variable resultado utilizando la funcion validationResult

  // verificar que no existan erroes para proceder a crear el usuario
  if (!resultado.isEmpty()) {
    return res.render("auth/register", {
      pagina: "Crear Cuenta",
      errores: resultado.array(), // responde un array con el resultado de las validaciones
      csrfToken: req.csrfToken(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //extraer los datos (destructuring)
  const { nombre, email, password } = req.body;

  // verificar que el correo no este duplicado

  const existeUsuario = await Usuario.findOne({
    where: { email },
  });

  if (existeUsuario) {
    return res.render("auth/register", {
      pagina: "crear cuenta",
      errores: [{ msg: "el usuario ya existe" }],
      csrfToken: req.csrfToken(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Almacenar usuario en la base de datos,
  // req.body se utiliza para leer la informacion enviada por un formulario,
  // crear usuario en la base de datos utilizando el modelo Usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  emailDeRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  // Mostrar memsaje de confirmacion
  res.render("auth/register", {
    pagina: "Crear Cuenta",
    mensajeDeConfirmacion: true,
  });
};

// Funcion que confirma una cuenta
const confirmarCuenta = async (req, res) => {
  const { token } = req.params;
  console.log(token);

  // Verificar que el token sea valido
  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmacion-cuenta", {
      pagina: "Error al confirmar tu cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo",
      error: true,
    });
  }

  //Confirmar la cuenta

  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  res.render("auth/confirmacion-cuenta", {
    pagina: "Cuenta Confirmada",
    mensaje: "Tu cuenta ha sido confirmada correctamente",
    error: false,
  });
};

// formulario recuperar password

const formularioRecuperarPassword = (req, res) => {
  res.render("auth/recuperarPassword", {
    pagina: "Recuperar tu acceso a Bienes Raices",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  //validacion
  await check("email").isEmail().withMessage("Eso no parece un email").run(req);
  let resultado = validationResult(req);

  // verificar que no existan erroes para proceder a crear el usuario
  if (!resultado.isEmpty()) {
    //errores
    return res.render("auth/recuperarPassword", {
      pagina: "Recuperar tu acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  //Buscar Usuario
  const { email } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    // vista si el correo no pertenece a ningun usuario
    return res.render("auth/recuperarPassword", {
      pagina: "Recuperar tu acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El Email no pertenece a ningun usuario" }],
    });
  }

  // generar un token
  usuario.token = generarId();
  await usuario.save();
  console.log(usuario);

  // Enviar un Email
  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  //Renderizar un mensaje

  res.render("auth/recuperarPassword", {
    pagina: "Restablece tu password",
    mensaje: "Hemos enviado un email con las instrucciones",
    csrfToken: req.csrfToken(),
    mensajeInstrucciones: true,
  });
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: { token } });
  if (!usuario) {
    res.render("auth/recuperarPassword", {
      pagina: "Restablece tu password",
      errores: [
        {
          msg: "Hubo un error al validar tu informacion, por favor intenta de nuevo",
        },
      ],
      csrfToken: req.csrfToken(),
    });
  }

  //Mostrar formulario para modificar el password
  res.render("auth/resetPassword", {
    pagina: "Restablece tu Password",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  // Validar el nuevo password
  await check("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe contener al menos 8 caracteres")
    .run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //errores
    return res.render("auth/resetPassword", {
      pagina: "Reestablece tu Password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Identificar quien hace el cambio

  const usuario = await Usuario.findOne({ where: { token } }); // identifica el usuario por el token

  // Hashear el nuevo password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(usuario.password, salt);
  usuario.token = null;

  await usuario.save();

  res.render("auth/confirmacion-cuenta", {
    pagina: "password Reestablecido",
    mensaje: "El Password se guardo Correctamente",
    csrfToken: req.csrfToken(),
  });
};

export {
  formularioLogin,
  autenticarUsuario,
  cerrarSesion,
  formularioRegister,
  registrarUsuario,
  formularioRecuperarPassword,
  resetPassword,
  confirmarCuenta,
  comprobarToken,
  nuevoPassword,
};
