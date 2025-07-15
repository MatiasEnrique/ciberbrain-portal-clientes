import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, executeWithUserValidation } from "@/lib/prisma";
import { Prisma } from "@/prisma/@/generated/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const trabajoId = parseInt(id);

    if (isNaN(trabajoId)) {
      return NextResponse.json({ error: "Invalid work order ID" }, { status: 400 });
    }

    // Execute all queries using executeWithUserValidation
    const [
      trabajoResult,
      sucesosResult,
      encuestaResult,
      accionesResult,
      formatosResult,
      tiposSucesosResult
    ] = await Promise.all([
      executeWithUserValidation(Prisma.sql`EXEC WP_TraerTrabajo @IDTrabajo = ${trabajoId}`) as Promise<any[]>,
      executeWithUserValidation(Prisma.sql`EXEC WP_SucesosTrabajo @IDTrabajo = ${trabajoId}`) as Promise<any[]>,
      executeWithUserValidation(Prisma.sql`EXEC WP_CUSTOM_Encuesta_Datos_a_Validar @IDTrabajo = ${trabajoId}`) as Promise<any[]>,
      executeWithUserValidation(Prisma.sql`EXEC WP_Get_Consumer_Functions @IDTrabajo = ${trabajoId}`) as Promise<any[]>,
      executeWithUserValidation(Prisma.sql`EXEC CS_ObtenerFormatosImpresion @IDTrabajo = ${trabajoId}, @Tipo = ${3}, @SubTipo = ${1}`) as Promise<any[]>,
      executeWithUserValidation(Prisma.sql`SELECT * FROM WP_Sucesos_Generables_Usuario(${trabajoId})`) as Promise<any[]>
    ]);

    const result = {
      trabajoResult,
      sucesosResult,
      encuestaResult,
      accionesResult,
      formatosResult,
      tiposSucesosResult
    };

    // Check if work order exists
    if (!result.trabajoResult || result.trabajoResult.length === 0) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    const trabajo = result.trabajoResult[0];

    // Parse survey data
    const encuestaPreguntas = result.encuestaResult.filter(item => item.Pregunta !== undefined) || [];
    const encuestaConceptos = result.encuestaResult.filter(item => item.Concepto !== undefined) || [];

    return NextResponse.json({
      trabajo: {
        ...trabajo,
        sucesos: result.sucesosResult || []
      },
      encuestaPreguntas,
      encuestaConceptos,
      acciones: result.accionesResult || [],
      formatosImpresion: result.formatosResult || [],
      tiposSucesos: result.tiposSucesosResult || []
    });

  } catch (error) {
    console.error("Error fetching work order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}