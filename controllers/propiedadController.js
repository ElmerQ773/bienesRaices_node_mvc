import { unlink } from "node:fs/promises";
import { validationResult } from "express-validator";
import {
  Precio,
  Categoria,
  Propiedad,
  Mensaje,
  Usuario,
} from "../models/index.js";
import { esVendedor, formatearFecha } from "../helpers/index.js";

const admin = async (req, res) => {
  // Leer Querystring
  const { pagina: paginaActual } = req.query;

  const expresion = /^[1-9]$/; // esto es una expresion regular. Indica que solo acepta digitos entre 0-9. ^ indica que siempre debe iniciar con un numero. El simbolo $ indica que siempre debe terminar con un numero

  //metodo test disponible cuando usas una expresion regular
  if (!expresion.test(paginaActual)) {
    return res.redirect("mis-propiedades?pagina=1");
  }

  try {
    const { id } = req.usuario; // extrayendo id del request

    //limites y offset para el paginador
    const limit = 10;
    const offset = paginaActual * limit - limit;

    const [propiedades, total] = await Promise.all([
      Propiedad.findAll({
        limit, // usando object literal enjansement en limit: limit. sequelize tiene un objeto limit
        offset, // usando object literal enjansement en offset: offset. sequelize tiene un objeto offset
        where: {
          usuarioId: id,
        },
        include: [
          // equivalente JOIN en sequelize (cruzar informacion de las tablas)
          { model: Categoria, as: "categoria" },
          { model: Precio, as: "precio" },
          { model: Mensaje, as: "mensajes" },
        ],
      }),
      Propiedad.count({
        where: {
          usuarioId: id,
        },
      }),
    ]);

    res.render("propiedades/admin", {
      pagina: "Mis Propiedades",
      propiedades,
      csrfToken: req.csrfToken(),
      paginas: Math.ceil(total / limit),
      paginaActual: Number(paginaActual),
      total,
      offset,
      limit,
    });
  } catch (error) {
    console.log(error);
  }
};

// Formulario para crear propiedad

const crear = async (req, res) => {
  // Consultar Modelo de Categoria Y Precio
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);
  res.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    csrfToken: req.csrfToken(),
    categorias, // Se escribe asi porque el valor de esta propiedad es un objeto del mismo nombre
    precios, // consultar javaScript object literal enhancement
    datos: {},
  });
};

const guardar = async (req, res) => {
  // Validacion
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //Consultar Modelo de Precio y Categoria
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/crear", {
      pagina: "Crear Propiedad",
      categorias,
      precios,
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      datos: req.body,
    });
  }

  // Crear un registro -- Usamos destructuring y object literal enjasement
  const {
    titulo,
    descripcion,
    habitaciones,
    estacionamiento,
    wc,
    calle,
    lat,
    lng,
    precio: precioId,
    categoria: categoriaId, // extrae categoria pero renombra la propiedad como categoriaId
  } = req.body;

  const { id: usuarioId } = req.usuario;

  try {
    const propiedadGuardada = await Propiedad.create({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precioId,
      categoriaId,
      usuarioId,
      imagen: "",
    });

    const { id } = propiedadGuardada;

    res.redirect(`/propiedades/agregar-imagen/${id}`);
  } catch (error) {
    console.log(error);
  }
};

const agregarImagen = async (req, res) => {
  const { id } = req.params;

  //Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  //validar que la propiedad no este publicada
  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }

  //Validar que la propiedad pertenece a quien visita esta pagina

  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("propiedades/agregar-imagen", {
    pagina: `agregar Imagen: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    propiedad,
  });
};

const almacenarImagen = async (req, res, next) => {
  const { id } = req.params;
  //Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  //validar que la propiedad no este publicada
  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }

  //Validar que la propiedad pertenece a quien visita esta pagina

  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("propiedades/agregar-imagen", {
    pagina: `agregar Imagen: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    propiedad,
  });

  try {
    //Almacenar Imagen Y publicar Propiedad
    propiedad.imagen = req.file.filename;
    propiedad.publicado = 1;

    await propiedad.save();

    next();
  } catch (error) {
    console.log(error);
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  // Validad que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que quien visita la URL, es quien creo la propiedad

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  // Consultar Modelo de Categoria Y Precio
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);
  res.render("propiedades/editar", {
    pagina: `Editar Propiedad: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: propiedad,
  });
};

const guardarCambios = async (req, res) => {
  // Validacion
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //Consultar Modelo de Precio y Categoria
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/editar", {
      pagina: "Editar Propiedad",
      categorias,
      precios,
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      datos: req.body,
    });
  }
  const { id } = req.params;
  // Validad que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que quien visita la URL, es quien creo la propiedad

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  //Reescribir el Objeto y Actualizarlo
  try {
    const {
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precio: precioId,
      categoria: categoriaId, // extrae categoria pero renombra la propiedad como categoriaId
    } = req.body;

    propiedad.set({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precioId,
      categoriaId,
    });

    await propiedad.save();

    res.redirect("/mis-propiedades");
  } catch (error) {
    console.log(error);
  }
};

// Funcion eliminar (para eliminar una propiedad)

const eliminar = async (req, res) => {
  const { id } = req.params;
  // Validad que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que quien visita la URL, es quien creo la propiedad

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  //Eliminar la Imagen
  await unlink(`public/uploads/${propiedad.imagen}`);
  console.log(`se elimino la imagen ${propiedad.imagen}`);

  //Eliminar la Propiedad
  await propiedad.destroy();
  res.redirect("/mis-propiedades");
};

//Cambiar Estado de la propiedad (publicado, no publicado)

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  // Validad que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que quien visita la URL, es quien creo la propiedad

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  //Actualizar
  propiedad.publicado = !propiedad.publicado;

  await propiedad.save();

  res.json({
    resultado: true,
  });
};

// Mostrar una Propiedad

const mostrarPropiedad = async (req, res) => {
  const { id } = req.params;

  // comprobar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      // equivalente JOIN en sequelize (cruzar informacion de las tablas)
      { model: Categoria, as: "categoria" },
      { model: Precio, as: "precio" },
    ],
  });

  if (!propiedad || !propiedad.publicado) {
    return res.redirect("/404");
  }

  res.render("propiedades/mostrar", {
    propiedad,
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    usuario: req.usuario,
    esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
  });
};

const enviarMensaje = async (req, res) => {
  const { id } = req.params;

  // comprobar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      // equivalente JOIN en sequelize (cruzar informacion de las tablas)
      { model: Categoria, as: "categoria" },
      { model: Precio, as: "precio" },
    ],
  });
  console.log(propiedad);
  console.log(id);

  if (!propiedad) {
    return res.redirect("/404");
  }

  //Renderizar los errores
  // Validacion
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render("propiedades/mostrar", {
      propiedad,
      pagina: propiedad.titulo,
      csrfToken: req.csrfToken(),
      usuario: req.usuario,
      esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
      errores: resultado.array(),
    });
  }

  const { mensaje } = req.body;
  const { id: propiedadeId } = req.params;
  const { id: usuarioId } = req.usuario;

  console.log(propiedadeId);

  //Almacenar Mensaje
  await Mensaje.create({
    mensaje,
    usuarioId,
    propiedadeId,
  });

  res.render("propiedades/mostrar", {
    propiedad,
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    usuario: req.usuario,
    esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
    enviado: true,
  });
};

//Leer Mensajes
const verMensajes = async (req, res) => {
  const { id } = req.params;

  //Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      // equivalente JOIN en sequelize (cruzar informacion de las tablas)
      {
        model: Mensaje,
        as: "mensajes",
        include: [{ model: Usuario.scope("eliminarCampos"), as: "usuario" }],
      },
    ],
  });

  // otro manera que encontre de acceder al nombre del usuario pero requiere otra consulta a la base de datos
  // const mensaje = await Mensaje.findOne({
  //   where: {
  //     propiedadeId: id,
  //   },
  //   include: [{ model: Usuario, as: "usuario" }],
  // });

  // console.log(mensaje);

  //Revisar que quien visita La URL sea quien creo la propiedad
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("propiedades/mensajes", {
    pagina: "Mensajes",
    mensajes: propiedad.mensajes,
    formatearFecha, // al solamente un valor se da por implicito que tanto llave como valor se llaman igual
  });
};

export {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen,
  editar,
  guardarCambios,
  eliminar,
  cambiarEstado,
  mostrarPropiedad,
  enviarMensaje,
  verMensajes,
};
