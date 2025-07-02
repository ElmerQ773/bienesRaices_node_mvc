/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/mapaInicio.js":
/*!******************************!*\
  !*** ./src/js/mapaInicio.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n(function () {\r\n  const lat = 10.4967603;\r\n  const lng = -66.8851178;\r\n  const mapa = L.map(\"mapa-inicio\").setView([lat, lng], 16);\r\n\r\n  const markers = new L.featureGroup().addTo(mapa);\r\n\r\n  let propiedades = [];\r\n\r\n  //Filtros\r\n  const filtros = {\r\n    categoria: \"\",\r\n    precio: \"\",\r\n  };\r\n\r\n  const categoriasSelect = document.querySelector(\"#categorias\");\r\n  const preciosSelect = document.querySelector(\"#precios\");\r\n\r\n  L.tileLayer(\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\", {\r\n    attribution:\r\n      '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',\r\n  }).addTo(mapa);\r\n\r\n  //Filtrado de categorias y precios\r\n  categoriasSelect.addEventListener(\"change\", (e) => {\r\n    filtros.categoria = +e.target.value;\r\n    filtrarPropiedades();\r\n  });\r\n\r\n  preciosSelect.addEventListener(\"change\", (e) => {\r\n    filtros.precio = +e.target.value;\r\n    filtrarPropiedades();\r\n  });\r\n\r\n  const obtenerPropiedades = async (req, res) => {\r\n    try {\r\n      const url = \"/api/propiedades\";\r\n\r\n      const respuesta = await fetch(url);\r\n\r\n      propiedades = await respuesta.json();\r\n\r\n      mostrarPropiedades(propiedades);\r\n    } catch (error) {\r\n      console.log(error);\r\n    }\r\n  };\r\n\r\n  const mostrarPropiedades = (propiedades) => {\r\n    //limpiar los markers Previos\r\n    markers.clearLayers();\r\n\r\n    propiedades.forEach((propiedad) => {\r\n      //agregar los pines\r\n      const marker = new L.marker([propiedad?.lat, propiedad?.lng], {\r\n        //propiedad? optional chaining\r\n        autoPan: true,\r\n      }).addTo(mapa).bindPopup(`\r\n          <p class=\"text-indigo-600 font-bold\">${propiedad.categoria.nombre}</p>\r\n          <h1 class=\"text-xl font-extrabold uppercase my-2\">${propiedad.titulo}</h1>\r\n          <img src=\"/uploads/${propiedad.imagen}\" alt=\"imagen de la propiedad ${propiedad.titulo}\">\r\n          <p class=\"text-gray-600 font-bold\">${propiedad.precio.nombre}</p>\r\n          <a href=\"/propiedad/${propiedad.id}\" class=\"bg-indigo-600 block p-2 text-center font-bold uppercase\"> Ver Propiedad </a>\r\n          `);\r\n\r\n      markers.addLayer(marker); //ayuda a que se puedan ocultar los resultados que no coincidan con la busqueda del usuario\r\n    });\r\n  };\r\n\r\n  //Funcion Para filtrar Propiedades\r\n  function filtrarPropiedades() {\r\n    const resultado = propiedades //chaining de filter crea un doble filtrado primero por categoria y luego por precio por eso es importante que en caso de que un filtro no este seleccionado devuelva todas las propiedades\r\n      .filter(filtrarCategoria)\r\n      .filter(filtrarPrecio);\r\n\r\n    mostrarPropiedades(resultado);\r\n  }\r\n\r\n  const filtrarCategoria = (propiedad) => {\r\n    return filtros.categoria\r\n      ? propiedad.categoriaId === filtros.categoria\r\n      : propiedad;\r\n  };\r\n\r\n  const filtrarPrecio = (propiedad) => {\r\n    return filtros.precio ? propiedad.precioId === filtros.precio : propiedad;\r\n  };\r\n\r\n  obtenerPropiedades();\r\n})();\r\n\n\n//# sourceURL=webpack://bienesraicesmvc-2/./src/js/mapaInicio.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/mapaInicio.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;