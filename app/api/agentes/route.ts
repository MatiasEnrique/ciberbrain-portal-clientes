import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lineaId = searchParams.get("lineaId") || "0";
  const provinciaId = searchParams.get("provinciaId");
  const partidoId = searchParams.get("partidoId");
  const localidadId = searchParams.get("localidadId");

  if (!provinciaId || !partidoId || !localidadId) {
    return NextResponse.json(
      { error: "provinciaId, partidoId, and localidadId are required" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$queryRaw<
      Array<{
        Cliente: string;
        Domicilio: string;
        Otros: string;
        Localidad: string;
        Provincia: string;
        Telefonos: string;
        Email: string;
        HorarioComercial: string;
      }>
    >`EXEC WP_AgentesProductoyZona @Agrupacion = ${parseInt(lineaId)}, @Provincia = ${parseInt(provinciaId)}, @Partido = ${parseInt(partidoId)}, @Localidad = ${parseInt(localidadId)}`;
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching agentes:", error);
    return NextResponse.json(
      { error: "Failed to fetch agentes" },
      { status: 500 }
    );
  }
}