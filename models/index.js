import Propiedad from "./Propiedad.js";
import Categoria from "./Categoria.js";
import Precio from "./Precio.js";
import Usuario from "./Usuario.js";
import Mensaje from "./Mensaje.js";

//Asociacion Propiedad - Precio

Propiedad.belongsTo(Precio, { foreingKey: "precioId" });

//Asociacion Propiedad - Categoria

Propiedad.belongsTo(Categoria, { foreingKey: "categoriaId" });

//Asociacion Usuario - Propiedad

Propiedad.belongsTo(Usuario, { foreingKey: "usuarioId" });

// Asociaciones para el modelo de mensaje

Mensaje.belongsTo(Usuario, { foreingKey: "usuarioId" });
Mensaje.belongsTo(Propiedad, { foreingKey: "propiedadId" }); //NO entiendo porque, no importa el valor que coloque en foreingkey sequelize crea las columnas con el valor que le da la gana en este caso coloca lapropiedadeId
Propiedad.hasMany(Mensaje, { foreingKey: "propiedadId" });

export { Propiedad, Precio, Categoria, Usuario, Mensaje };
