import nodemailer from "nodemailer";

const emailDeRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const { nombre, email, token } = datos;

  transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "Confirma tu cuenta en BienesRaices.com",
    text: "Confirma tu cuenta en BienesRaices.com",
    html: `<p> Hola ${nombre} confirma tu cuenta en BienesRaices.com </p>
            <p> Tu cuenta ya esta lista solo debes confirmarla en el siguiente enlace:

            <a href="${process.env.BACKEND_URL}:${
      process.env.BACKEND_PORT ?? 3000
    }/auth/confirmarCuenta/${token}"> Confirmar Cuenta </a> </p>
            
            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje </p>
            `,
  });
  console.log(token);
};

const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const { nombre, email, token } = datos;

  transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "restablece tu password en BienesRaices.com",
    text: "restablece tu password en BienesRaices.com",
    html: `<p> Hola ${nombre} haz solicitado restablecer tu password en BienesRaices.com </p>
            <p> sigue el siguiente enlace para generar un password nuevo en el siguiente enlace:

            <a href="${process.env.BACKEND_URL}:${
      process.env.BACKEND_PORT ?? 3000
    }/auth/recuperarPassword/${token}"> restablecer password </a> </p>
            
            <p>Si tu no solicitaste el cambio de password, puedes ignorar el mensaje </p>
            `,
  });
  console.log(token);
};

export { emailDeRegistro, emailOlvidePassword };
