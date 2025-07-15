import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LocalidadSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const partidoIdParam = searchParams.get("partidoId");

  if (!partidoIdParam) {
    return NextResponse.json(
      { error: "partidoId is required" },
      { status: 400 }
    );
  }

  try {
    const response = await prisma.$queryRaw`
      SELECT ID, Localidad 
      FROM CC_Localidades 
      WHERE Partido = ${parseInt(partidoIdParam)} 
      ORDER BY localidad
    `;

    const parsedResponse = LocalidadSchema.array().parse(response);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error fetching localidades:", error);
    return NextResponse.json(
      { error: "Failed to fetch localidades" },
      { status: 500 }
    );
  }
}
