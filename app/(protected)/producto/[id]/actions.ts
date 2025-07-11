"use server";
import { GenerateReparation, generateReparationSchema } from "./schemas";
import { auth } from "@/auth";
import { executeWithUserValidation } from "@/lib/prisma";
import { Prisma } from "@/prisma/@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function generateReparation(data: GenerateReparation) {
  try {
    const session = await auth();

    if (!session) {
      return { error: "No estás autenticado" };
    }

    if (!session.user) {
      return { error: "No estás autenticado" };
    }

    const parsed = generateReparationSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.message };
    }

    const { fecha, politica, descripcion, opcion_asistencia, ID } = parsed.data;

    let query;

    if (fecha) {
      query = Prisma.sql`EXEC WP_Generar_Trabajo
            @IDUsuario = ${session.user.id},
            @IDTrabajo = 0,
            @IDProducto = ${ID},
            @IDPolitica = ${politica},
            @Falla = ${descripcion},
            @FormaAsistencia = ${opcion_asistencia},
            @FechaEntrega = ${fecha}
            `;
    } else {
      query = Prisma.sql`EXEC WP_Generar_Trabajo
            @IDUsuario = ${session.user.id},
            @IDTrabajo = 0,
            @IDProducto = ${ID},
            @IDPolitica = ${politica},
            @Falla = ${descripcion},
            @FormaAsistencia = ${opcion_asistencia}
            `;
    }

    const result = await executeWithUserValidation(query);

    revalidatePath(`/producto/${ID}`, "page");
    return { success: result };
  } catch (error) {
    console.error(error);
    return { error: "Error al generar la reparación" };
  }
}
