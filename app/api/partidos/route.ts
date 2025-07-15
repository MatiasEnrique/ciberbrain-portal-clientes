import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PartidoSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provinciaParam = searchParams.get("provincia");
  const provinciaIdParam = searchParams.get("provinciaId");

  if (!provinciaParam && !provinciaIdParam) {
    return NextResponse.json(
      { error: "Provincia or provinciaId is required" },
      { status: 400 }
    );
  }

  try {
    let response;

    if (provinciaIdParam) {
      response = await prisma.$queryRaw`
        SELECT ID, Partido 
        FROM CC_Partidos 
        WHERE Provincia = ${parseInt(provinciaIdParam)} AND Activo = 1
        ORDER BY partido
      `;
    } else {
      // String-based lookup for registration
      response = await prisma.$queryRaw`
        SELECT ID, Partido 
        FROM CC_Partidos 
        WHERE Provincia = ${provinciaParam} AND Activo = 1
        ORDER BY partido
      `;
    }

    const parsedResponse = PartidoSchema.array().parse(response);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error fetching partidos:", error);
    return NextResponse.json(
      { error: "Failed to fetch partidos" },
      { status: 500 }
    );
  }
}
