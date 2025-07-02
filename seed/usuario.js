import bcrypt from "bcrypt";

const usuarios = [
  {
    nombre: "elmer",
    email: "elmer@gmail.com",
    confirmado: 1,
    password: bcrypt.hashSync("password", 10),
  },
  {
    nombre: "elmer2",
    email: "elmer2@gmail.com",
    confirmado: 1,
    password: bcrypt.hashSync("password", 10),
  },
];

export default usuarios;
