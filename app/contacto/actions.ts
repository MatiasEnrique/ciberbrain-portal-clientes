"use server";

import { contactFormSchema } from "./schemas";
import { sendEmail } from "@/lib/email";

export async function enviarMensajeContacto(formData: FormData) {
  const validatedFields = contactFormSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    asunto: formData.get("asunto"),
    mensaje: formData.get("mensaje"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Por favor, completa todos los campos requeridos correctamente.",
    };
  }

  const { nombre, email, telefono, asunto, mensaje } = validatedFields.data;

  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo mensaje de contacto</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nuevo Mensaje de Contacto</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">Información del remitente:</h2>
                      
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="10" border="0" style="margin-bottom: 20px;">
                        <tr>
                          <td style="background-color: #f8f9fa; border-left: 4px solid #000000;">
                            <p style="margin: 5px 0;"><strong>Nombre:</strong> ${nombre}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                            ${
                              telefono
                                ? `<p style="margin: 5px 0;"><strong>Teléfono:</strong> ${telefono}</p>`
                                : ""
                            }
                            <p style="margin: 5px 0;"><strong>Asunto:</strong> ${asunto}</p>
                          </td>
                        </tr>
                      </table>
                      
                      <h3 style="color: #333333; margin: 20px 0 10px 0; font-size: 18px;">Mensaje:</h3>
                      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef;">
                        <p style="margin: 0; white-space: pre-wrap; color: #555555;">${mensaje}</p>
                      </div>
                      
                      <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
                      
                      <p style="color: #666666; font-size: 14px; text-align: center; margin: 0;">
                        Este mensaje fue enviado desde el formulario de contacto del Portal de Clientes.
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

    await sendEmail(
      process.env.CONTACT_EMAIL || "contacto@ciberbrain.com",
      `[Portal Clientes] ${asunto}`,
      emailHtml
    );

    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de mensaje</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Mensaje Recibido</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6;">Hola ${nombre},</p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                        Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará y te responderemos a la brevedad posible.
                      </p>
                      
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
                        <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 16px;">Resumen de tu mensaje:</h3>
                        <p style="margin: 5px 0; color: #666666;"><strong>Asunto:</strong> ${asunto}</p>
                        <p style="margin: 5px 0; color: #666666;"><strong>Mensaje:</strong></p>
                        <p style="margin: 5px 0; color: #666666; white-space: pre-wrap;">${mensaje}</p>
                      </div>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                        Gracias por contactarnos.
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
                      
                      <p style="color: #666666; font-size: 14px; text-align: center; margin: 0;">
                        Este es un mensaje automático. Por favor, no respondas a este email.
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

    await sendEmail(
      email,
      `Hemos recibido tu mensaje - ${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
      confirmationHtml
    );

    return {
      success: true,
      message:
        "Tu mensaje ha sido enviado correctamente. Te responderemos pronto.",
    };
  } catch (error) {
    console.error("Error al enviar mensaje de contacto:", error);
    return {
      success: false,
      message:
        "Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente.",
    };
  }
}
