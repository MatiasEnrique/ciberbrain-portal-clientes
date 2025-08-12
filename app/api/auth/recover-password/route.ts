import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        EMail: email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Si el correo electrónico está registrado, recibirás instrucciones para recuperar tu contraseña.",
        },
        { status: 200 }
      );
    }

    // Check if user is activated
    if (user.EstadoRegistracion !== 1) {
      // User not activated, send activation email instead
      const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verification?token=${user.SessionOrigen}`;

      const emailSubject = "Finalización del proceso de registración";
      const emailBody = `
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificación de correo electrónico</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td style="padding: 20px 0;">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.1);">
                          <tr>
                              <td align="center" style="padding: 40px 0 30px 0; background-color: #6366f1; color: #ffffff;">
                                  <h1 style="margin: 0; font-size: 28px;">Enlace de verificación</h1>
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 40px 30px;">
                                  <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px;">
                                      Tu cuenta aún no ha sido verificada. Te hemos enviado un correo electrónico con información para verificar tu email, por favor sigue el enlace incluido a continuación:
                                  </p>
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tr>
                                          <td align="center" style="padding: 20px 0;">
                                              <a href="${verificationLink}" target="_blank" style="background-color: #6366f1; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 600; display: inline-block;">
                                                  Verificar mi email
                                              </a>
                                          </td>
                                      </tr>
                                  </table>
                                  <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                                      Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                                  </p>
                                  <p style="margin: 10px 0 20px 0; color: #4f46e5; font-size: 12px; word-break: break-all;">
                                      ${verificationLink}
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

      await sendEmail(email, emailSubject, emailBody);

      return NextResponse.json(
        {
          success: true,
          message:
            "Tu cuenta aún no ha sido verificada. Te hemos enviado un correo electrónico con información para verificar tu email.",
        },
        { status: 200 }
      );
    }

    // User is activated, send password recovery email
    const recoveryLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${user.SessionOrigen}`;

    const emailSubject = "Recuperar mi clave";
    const emailBody = `
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td style="padding: 20px 0;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td align="center" style="padding: 40px 0 30px 0; background-color: #6366f1; color: #ffffff;">
                                <h1 style="margin: 0; font-size: 28px;">Instrucciones enviadas!</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px;">
                                    Te hemos enviado un correo electrónico con información para recuperar tu clave. Sigue este enlace para recuperar tu clave:
                                </p>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center" style="padding: 20px 0;">
                                            <a href="${recoveryLink}" target="_blank" style="background-color: #6366f1; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 600; display: inline-block;">
                                                Recuperar mi clave
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                                    Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                                </p>
                                <p style="margin: 10px 0 20px 0; color: #4f46e5; font-size: 12px; word-break: break-all;">
                                    ${recoveryLink}
                                </p>
                                <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                                    Si no solicitaste recuperar tu contraseña, puedes ignorar este correo de forma segura.
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

    await sendEmail(email, emailSubject, emailBody);

    return NextResponse.json(
      {
        success: true,
        message:
          "Te hemos enviado un correo electrónico con información para recuperar tu clave.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password recovery error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Email inválido",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Lo sentimos! Hemos intentado enviarte un mail pero hemos tenido un problema.",
      },
      { status: 500 }
    );
  }
}
