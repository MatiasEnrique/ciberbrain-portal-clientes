import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProvinciaSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paisParam = searchParams.get("pais");
  const paisIdParam = searchParams.get("paisId");

  if (!paisParam && !paisIdParam) {
    return NextResponse.json(
      { error: "Pais or paisId is required" },
      { status: 400 }
    );
  }

  try {
    let response;

    if (paisIdParam) {
      response = await prisma.$queryRaw`
        SELECT ID, Provincia 
        FROM CC_Provincias 
        WHERE Pais = ${parseInt(paisIdParam)} AND Activo = 1
        ORDER BY provincia
      `;
    } else {
      response = await prisma.$queryRaw`
        SELECT ID, Provincia 
        FROM CC_Provincias 
        WHERE Pais = ${paisParam} AND Activo = 1
        ORDER BY provincia
      `;
    }

    const parsedResponse = ProvinciaSchema.array().parse(response);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error fetching provincias:", error);
    return NextResponse.json(
      { error: "Failed to fetch provincias" },
      { status: 500 }
    );
  }
}
