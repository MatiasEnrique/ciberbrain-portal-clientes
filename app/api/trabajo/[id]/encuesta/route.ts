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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const trabajoId = parseInt(id);

    if (isNaN(trabajoId)) {
      return NextResponse.json({ error: "Invalid work order ID" }, { status: 400 });
    }

    const body = await request.json();
    const { respuestas, conformidad, comentarios } = body;

    // Verify work order belongs to user and check if survey is already completed
    const trabajoResult = await executeWithUserValidation(
      Prisma.sql`EXEC WP_TraerTrabajo @IDTrabajo = ${trabajoId}`
    ) as any[];

    if (!trabajoResult || trabajoResult.length === 0) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    const trabajo = trabajoResult[0];

    // Check if survey already completed
    if (trabajo.Encuesta === 1) {
      return NextResponse.json({ error: "Survey already completed" }, { status: 400 });
    }

    // Build XML for survey data (matching the ASP.NET format)
    let xmlData = '{ "root" : { ';
    let coma = "";

    if (respuestas && respuestas.length > 0) {
      xmlData += '"Respuesta" : ' + JSON.stringify(respuestas);
      coma = ",";
    }

    if (conformidad && conformidad.length > 0) {
      xmlData += coma + '"Conformidad" : ' + JSON.stringify(conformidad);
      coma = ",";
    }

    if (comentarios) {
      xmlData += coma + '"Comentarios" : "' + comentarios + '"';
    }

    xmlData += "}}";

    // Submit survey using stored procedure
    await executeWithUserValidation(
      Prisma.sql`EXEC WP_Grabar_Encuesta @IDTrabajo = ${trabajoId}, @Datos = ${xmlData}`
    );

    return NextResponse.json({ 
      success: true, 
      message: "Survey submitted successfully" 
    });

  } catch (error) {
    console.error("Error submitting survey:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}