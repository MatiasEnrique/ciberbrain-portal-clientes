"use server";

import { registerSchema, RegisterSchemaType } from "./schemas";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function register(rawData: RegisterSchemaType) {
  try {
    const validationResult = registerSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: "Error de validación. Por favor, revisa los campos.",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const data = validationResult.data;

    const birthDateObj = data.birthDate
      ? new Date(data.birthDate.split("/").reverse().join("-"))
      : null;
    const validBirthDate =
      birthDateObj && !isNaN(birthDateObj.getTime()) ? birthDateObj : null;

    const userData = {
      Id: 0,
      Apellido: data.lastName,
      Nombre: data.firstName,
      Nombre2: null,
      CodCli: null,
      Email: data.email,
      Password: data.password,
      Perfil: data.profile === "Consumidor" ? 1 : 0,
      Nacimiento: validBirthDate,
      Calle: data.street,
      Altura: data.streetNumber,
      Otros: data.otherAddressDetails || "",
      Localidad: data.city,
      IDLocalidad: 0,
      CodigoPostal: data.postalCode,
      Partido: null,
      IDPartido: data.partido,
      Provincia: data.province,
      Pais: data.country,
      Entre: data.crossStreet1 || "",
      Entre2: data.crossStreet2 || "",
      Telefonos: data.phone || "",
      Horario: data.preferredTime || "",
      Comentarios: null,
      Celular: data.mobilePhone,
      Session: crypto.randomUUID(),
      Documento: data.dni,
      Web: null,
      Latitud: null,
      Longitud: null,
    };

    const result = await prisma.$executeRaw`
      DECLARE @IdOut INT;
      EXEC CR_Grabar_Contacto 
        @Apellido = ${userData.Apellido},
        @Nombre = ${userData.Nombre},
        @Nombre2 = ${userData.Nombre2},
        @CodCli = ${userData.CodCli},
        @Email = ${userData.Email},
        @Password = ${userData.Password},
        @Perfil = ${userData.Perfil},
        @Calle = ${userData.Calle},
        @Altura = ${userData.Altura},
        @Otros = ${userData.Otros},
        @Localidad = ${userData.Localidad},
        @IDLocalidad = ${userData.IDLocalidad},
        @CodigoPostal = ${userData.CodigoPostal},
        @Partido = ${userData.Partido},
        @IDPartido = ${userData.IDPartido},
        @Provincia = ${userData.Provincia},
        @Pais = ${userData.Pais},
        @Entre = ${userData.Entre},
        @Entre2 = ${userData.Entre2},
        @Telefonos = ${userData.Telefonos},
        @Horario = ${userData.Horario},
        @Comentarios = ${userData.Comentarios},
        @Celular = ${userData.Celular},
        @Session = ${userData.Session},
        @Documento = ${userData.Documento},
        @Web = ${userData.Web},
        @Latitud = ${userData.Latitud},
        @Longitud = ${userData.Longitud},
        @Id = @IdOut OUTPUT;
      SELECT @IdOut as id;
    `;

    if (result > 0) {
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification?session=${userData.Session}`;
      const emailSubject = "Verificación de correo electrónico";
      const emailBody = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificación de correo electrónico</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f8fafc;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td style="padding: 20px 0;">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
                          <tr>
                              <td align="center" style="padding: 40px 0 30px 0; background-color: #6366f1; color: #ffffff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                                  <h1 style="margin: 0; font-size: 28px; font-weight: 700;">¡Bienvenido al Portal de Clientes!</h1>
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 40px 30px;">
                                  <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; line-height: 1.5;">
                                      Gracias por registrarte. Para activar tu cuenta, por favor haz clic en el botón de abajo.
                                  </p>
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tr>
                                          <td align="center" style="padding: 20px 0;">
                                              <a href="${verificationLink}" target="_blank" style="background-color: #6366f1; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 600; display: inline-block;">
                                                  Activar mi cuenta
                                              </a>
                                          </td>
                                      </tr>
                                  </table>
                                  <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                                      Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                                  </p>
                                  <p style="margin: 10px 0 20px 0; color: #4f46e5; font-size: 12px; line-height: 1.5; word-break: break-all;">
                                      ${verificationLink}
                                  </p>
                                  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                                      Si no te has registrado en nuestro sitio, puedes ignorar este correo electrónico de forma segura.
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 30px; text-align: center; background-color: #f3f4f6; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                      &copy; ${new Date().getFullYear()} Portal de Clientes. Todos los derechos reservados.
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      `;

      try {
        await sendEmail(userData.Email, emailSubject, emailBody);
        return {
          success: true,
          message:
            "¡Registro exitoso! Se ha enviado un correo de verificación a tu dirección de email.",
        };
      } catch (emailError) {
        console.error(
          "Registration successful, but failed to send verification email.",
          emailError
        );
        return {
          success: true,
          message:
            "Registro exitoso, pero no se pudo enviar el email de verificación. Por favor, contacte a soporte para activar su cuenta.",
        };
      }
    } else {
      return {
        success: false,
        message:
          "Error al registrarse. Es posible que el correo electrónico o DNI ya estén en uso.",
      };
    }
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Ocurrió un error inesperado durante el registro.",
    };
  }
}

async function sendEmail(email: string, subject: string, body: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: {
      name: process.env.EMAIL_SENDER_ALIAS ?? "Portal de Clientes",
      address: process.env.EMAIL_USER!,
    },
    to: email,
    subject: subject,
    html: body,
  });
}
