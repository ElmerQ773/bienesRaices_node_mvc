(function () {
  const lat = 10.4967603;
  const lng = -66.8851178;
  const mapa = L.map("mapa-inicio").setView([lat, lng], 16);

  const markers = new L.featureGroup().addTo(mapa);

  let propiedades = [];

  //Filtros
  const filtros = {
    categoria: "",
    precio: "",
  };

  const categoriasSelect = document.querySelector("#categorias");
  const preciosSelect = document.querySelector("#precios");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  //Filtrado de categorias y precios
  categoriasSelect.addEventListener("change", (e) => {
    filtros.categoria = +e.target.value;
    filtrarPropiedades();
  });

  preciosSelect.addEventListener("change", (e) => {
    filtros.precio = +e.target.value;
    filtrarPropiedades();
  });

  const obtenerPropiedades = async (req, res) => {
    try {
      const url = "/api/propiedades";

      const respuesta = await fetch(url);

      propiedades = await respuesta.json();

      mostrarPropiedades(propiedades);
    } catch (error) {
      console.log(error);
    }
  };

  const mostrarPropiedades = (propiedades) => {
    //limpiar los markers Previos
    markers.clearLayers();

    propiedades.forEach((propiedad) => {
      //agregar los pines
      const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
        //propiedad? optional chaining
        autoPan: true,
      }).addTo(mapa).bindPopup(`
          <p class="text-indigo-600 font-bold">${propiedad.categoria.nombre}</p>
          <h1 class="text-xl font-extrabold uppercase my-2">${propiedad.titulo}</h1>
          <img src="/uploads/${propiedad.imagen}" alt="imagen de la propiedad ${propiedad.titulo}">
          <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
          <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase"> Ver Propiedad </a>
          `);

      markers.addLayer(marker); //ayuda a que se puedan ocultar los resultados que no coincidan con la busqueda del usuario
    });
  };

  //Funcion Para filtrar Propiedades
  function filtrarPropiedades() {
    const resultado = propiedades //chaining de filter crea un doble filtrado primero por categoria y luego por precio por eso es importante que en caso de que un filtro no este seleccionado devuelva todas las propiedades
      .filter(filtrarCategoria)
      .filter(filtrarPrecio);

    mostrarPropiedades(resultado);
  }

  const filtrarCategoria = (propiedad) => {
    return filtros.categoria
      ? propiedad.categoriaId === filtros.categoria
      : propiedad;
  };

  const filtrarPrecio = (propiedad) => {
    return filtros.precio ? propiedad.precioId === filtros.precio : propiedad;
  };

  obtenerPropiedades();
})();
