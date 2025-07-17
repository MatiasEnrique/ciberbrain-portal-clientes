"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileSchemaType, profileSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export type Contacto = {
  Id: number;
  Apellido: string;
  Nombre: string;
  Nombre2: string | null;
  CodCli: string | null;
  Email: string;
  Password?: string;
  Perfil: number;
  Nacimiento: Date | null;
  Calle: string;
  Altura: string;
  Otros: string | null;
  Localidad: string;
  IDLocalidad: number;
  CodigoPostal: string;
  Partido: string | null;
  IDPartido: number;
  Provincia: number;
  Pais: number;
  Entre: string | null;
  Entre2: string | null;
  Telefonos: string | null;
  Horario: string | null;
  Comentarios: string | null;
  Celular: string;
  Session: string;
  Documento: string;
  Web: string | null;
  Latitud: number | null;
  Longitud: number | null;
};

export async function updateProfile(rawData: ProfileSchemaType) {
  const session = await auth();

  if (!session) {
    return {
      success: false,
      message: "Usuario no autenticado.",
    };
  }

  if (!session.user) {
    return {
      success: false,
      message: "Usuario no autenticado.",
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      EMail: session.user.email,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Usuario no encontrado.",
    };
  }

  try {
    const validationResult = profileSchema.safeParse(rawData);

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
      Id: session.user.id,
      Apellido: data.lastName,
      Nombre: data.firstName,
      Nombre2: user.Nombre2,
      CodCli: user.CodCli,
      Email: data.email,
      Password: user.Password,
      Perfil: user.Perfil,
      Nacimiento: validBirthDate,
      Calle: data.street,
      Altura: data.streetNumber,
      Otros: data.otherAddressDetails || "",
      Localidad: data.city,
      IDLocalidad: user.IDLocalidad,
      CodigoPostal: data.postalCode,
      Partido: user.Partido,
      IDPartido: data.partido,
      Provincia: data.province,
      Pais: data.country,
      Entre: data.crossStreet1 || "",
      Entre2: data.crossStreet2 || "",
      Telefonos: data.phone || "",
      Horario: data.preferredTime || "",
      Comentarios: user.Comentarios,
      Celular: data.mobilePhone,
      Session: user.SessionOrigen,
      Documento: data.dni,
      Web: user.Web,
      Latitud: user.Latitud,
      Longitud: user.Longitud,
    };

    await prisma.$executeRaw`
      EXEC CR_Grabar_Contacto 
        @Id = ${userData.Id},
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
        @Longitud = ${userData.Longitud};
    `;

    revalidatePath("/perfil");

    return {
      success: true,
      message: "Perfil actualizado con éxito.",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Ocurrió un error inesperado al actualizar el perfil.",
    };
  }
}
