import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, executeWithUserValidation } from "@/lib/prisma";
import { Prisma } from "@/prisma/@/generated/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const trabajoId = parseInt(id);

    if (isNaN(trabajoId)) {
      return NextResponse.json(
        { error: "ID de trabajo inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { tipoSuceso, comentarios } = body;

    if (!tipoSuceso || !comentarios) {
      return NextResponse.json(
        {
          error:
            "Debes seleccionar un tipo de suceso y proporcionar una descripción.",
        },
        { status: 400 }
      );
    }

    const trabajoResult = (await executeWithUserValidation(
      Prisma.sql`EXEC WP_TraerTrabajo @IDTrabajo = ${trabajoId}`
    )) as any[];

    if (!trabajoResult || trabajoResult.length === 0) {
      return NextResponse.json(
        { error: "Trabajo no encontrado" },
        { status: 404 }
      );
    }

    const trabajo = trabajoResult[0];

    if (trabajo.EstadoGeneral > 4) {
      return NextResponse.json(
        {
          error: "No se puede agregar sucesos a un trabajo cerrado.",
        },
        { status: 400 }
      );
    }

    await executeWithUserValidation(
      Prisma.sql`EXEC CS_GeneraSucesoTrabajo @Suceso = ${tipoSuceso}, @IDTrabajo = ${trabajoId}, @Comentarios = ${comentarios}, @Tipo = ${2}`
    );

    const sucesosResult = (await executeWithUserValidation(
      Prisma.sql`EXEC WP_SucesosTrabajo @IDTrabajo = ${trabajoId}`
    )) as any[];

    const nuevoSuceso =
      sucesosResult && sucesosResult.length > 0 ? sucesosResult[0] : null;

    return NextResponse.json({
      success: true,
      message: "Suceso creado correctamente",
      suceso: nuevoSuceso,
    });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error?.message || JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
