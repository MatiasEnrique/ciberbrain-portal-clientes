import { prisma } from "@/lib/prisma";

export type EditableTextData = {
  [elementId: string]: string | null;
};

export async function getEditableTexts(
  pageName: string,
  perfil: number = 0,
  entorno: string = "default"
): Promise<EditableTextData> {
  try {
    const texts = await prisma.$queryRaw<
      Array<{
        Control: string;
        Texto: string | null;
      }>
    >`
      EXEC WP_Texto_Pagina @Pagina = ${pageName}, @Control = '', @Perfil = ${perfil}, @Entorno = ${entorno}
    `;

    const result: EditableTextData = {};
    texts.forEach((text) => {
      result[text.Control] = text.Texto;
    });

    return result;
  } catch (error) {
    try {
      const texts = await prisma.editableText.findMany({
        where: {
          PageName: pageName,
          Perfil: perfil,
          Entorno: entorno,
        },
        select: {
          ElementId: true,
          Content: true,
        },
      });

      const result: EditableTextData = {};
      texts.forEach((text) => {
        result[text.ElementId] = text.Content;
      });

      return result;
    } catch (fallbackError) {
      return {};
    }
  }
}

export async function updateEditableText(
  pageName: string,
  elementId: string,
  content: string,
  modifiedBy: number,
  perfil: number = 0,
  entorno: string = "default"
): Promise<boolean> {
  try {
    // Use the legacy stored procedure WP_Actualizar_Texto to update text content
    await prisma.$executeRaw`
      EXEC WP_Actualizar_Texto 
        @Pagina = ${pageName}, 
        @Control = ${elementId}, 
        @Entorno = ${entorno}, 
        @Texto = ${content}, 
        @Perfil = ${perfil}
    `;

    return true;
  } catch (error) {
    try {
      await prisma.editableText.upsert({
        where: {
          PageName_ElementId_Perfil_Entorno: {
            PageName: pageName,
            ElementId: elementId,
            Perfil: perfil,
            Entorno: entorno,
          },
        },
        update: {
          Content: content,
          ModifiedBy: modifiedBy,
          LastModified: new Date(),
        },
        create: {
          PageName: pageName,
          ElementId: elementId,
          Content: content,
          Perfil: perfil,
          Entorno: entorno,
          ModifiedBy: modifiedBy,
        },
      });

      return true;
    } catch (fallbackError) {
      return false;
    }
  }
}

export const defaultTexts = {
  RedAgentes: {
    lbl_titulo_agentes: "Red de Agentes Autorizados",
    lbl_subtitulo_agentes:
      "Encuentre el agente de servicios mas cercano a su domicilio.- Cuando deba recurrir a nuestros servicios de garantía no olvide de llevar su comprobante de compra",
    Descripcion_Linea: "Línea:",
  },
  Contacto: {
    // Original legacy texts
    Titulo_Contacto: "Información de Contacto",
    Subtitulo_Contacto: "Contactese con nosotros de distintas maneras",
    Texto_Contacto: "Telefono, Redes, etc",

    // Additional editable texts for enhanced functionality
    Titulo_Formulario: "Envíanos un mensaje",
    Descripcion_Formulario:
      "Completa el formulario y te responderemos a la brevedad",
    Titulo_Info_Contacto: "Información de contacto",
    Descripcion_Info_Contacto:
      "También puedes comunicarte con nosotros por estos medios",
    Telefono_Contacto: "+54 11 1234-5678",
    Horario_Contacto: "Lunes a Viernes de 9:00 a 18:00 hs",
    Email_Contacto: "contacto@ciberbrain.com",
    Email_Soporte: "soporte@ciberbrain.com",
    Direccion_Contacto: "Av. Ejemplo 1234, Piso 5",
    Ciudad_Contacto: "Buenos Aires, Argentina",
    Titulo_Redes: "Redes sociales",
    Descripcion_Redes: "Síguenos en nuestras redes para estar al día",
  },
  PreguntasFrecuentes: {
    lbl_titulo_preguntas: "Preguntas frecuentes",
    lbl_subtitulo_preguntas:
      "Encuentre las respuestas que con frecuencia, pueden ayudarlo a poner en marcha o utilizar su producto logrando las mejores prestaciones",
  },
};
