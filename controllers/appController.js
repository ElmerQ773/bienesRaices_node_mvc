import { Sequelize } from "sequelize";
import { Categoria, Precio, Propiedad } from "../models/index.js";

const inicio = async (req, res) => {
  const [categorias, precios, casas, departamentos] = await Promise.all([
    Categoria.findAll({ raw: true }),
    Precio.findAll({ raw: true }),
    //mostrar casa en pagina de inico
    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 1,
      },
      include: [{ model: Precio, as: "precio" }],
      order: [["createdAt", "DESC"]],
    }),
    //mostrar departamentos en pagina de inicio

    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 2,
      },
      include: [{ model: Precio, as: "precio" }],
      order: [["createdAt", "DESC"]],
    }),
  ]);

  res.render("inicio", {
    pagina: "inicio",
    categorias,
    precios,
    casas,
    departamentos,
    csrfToken: req.csrfToken(),
  });
};

const categoria = async (req, res) => {
  const { id } = req.params;
  //Comprobar que la categoria exista
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    return res.redirect("/404");
  }

  console.log(categoria);
  //Obtener las propiedades que pertenecen a esa categoria
  const propiedades = await Propiedad.findAll({
    where: {
      categoriaId: id,
    },
    include: [{ model: Precio, as: "precio" }],
  });

  res.render("categoria", {
    pagina: `${categoria.nombre}s En Venta`,
    propiedades,
    csrfToken: req.csrfToken(),
  });
};

const noEncontrado = (req, res) => {
  res.render("404", {
    pagina: "No Encontrada",
    csrfToken: req.csrfToken(),
  });
};

const buscador = async (req, res) => {
  const { termino } = req.body;
  const previousUrl = req.get("Referrer") || "/"; // redireccionar a la pagina anterior
  //Validar que termino no este vacio
  if (!termino.trim()) {
    return res.redirect(previousUrl);
  }

  //Consultar las propiedades
  const propiedades = await Propiedad.findAll({
    where: {
      // dentro de where se coloca la columna en la que seuqelize va abuscar se pueden colocar varias columnas
      titulo: {
        [Sequelize.Op.like]: "%" + termino + "%", // con esta sintasix busca el termina en cualquier lugar de la cadena
      },
    },
    include: [{ model: Precio, as: "precio" }],
  });

  console.log(propiedades);

  res.render("busqueda", {
    pagina: "Resultados de la Busqueda",
    propiedades,
    csrfToken: req.csrfToken(),
  });
};

export { inicio, categoria, noEncontrado, buscador };
