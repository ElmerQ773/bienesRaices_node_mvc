import { Dropzone } from "dropzone";

const token = document //csrfToken que se encuentra en el header
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

// objeto de configuracion de opciones para imagenes en dropzone
Dropzone.options.imagen = {
  dictDefaultMessage: "Sube Tus Imagenes Aqui",
  acceptedFiles: ".png, .jpg, .jpeg",
  maxFilesize: 5,
  maxFiles: 1,
  parallelUploads: 1,
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictRemoveFile: "Borrar Archivo",
  dictMaxFilesExceeded: "El Limite es 1 Archivo",
  headers: {
    "CSRF-Token": token, //De esta manera se debe pasar a dropzon el token que va en el header para que suba las imagenes al servidor
  },
  paramName: "imagen",

  init: function () {
    const dropzone = this;
    const btnPublicar = document.querySelector("#publicar");

    btnPublicar.addEventListener("click", function () {
      dropzone.processQueue();
    });

    dropzone.on("queuecomplete", function () {
      if (dropzone.getActiveFiles().length == 0) {
        window.location.href = "/mis-propiedades";
      }
    });
  },
};
