const esVendedor = (usuarioId, propiedadUsuarioId) => {
  return usuarioId === propiedadUsuarioId;
};

const formatearFecha = (fecha) => {
  //toISOString() convierte la fecha a un string sin alterarla a diferencia de toString()
  //slice() toma los primero 10 caracteres de ese string

  const nuevaFecha = new Date(fecha).toISOString().slice(0, 10);

  const opciones = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(nuevaFecha).toLocaleDateString("es-ES", opciones);
};

export { esVendedor, formatearFecha };
