import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaisSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const response =
      await prisma.$queryRaw`Select ID, Pais FROM CC_Paises WHERE Activo = 1 Order by Pais`;

    const parsedResponse = PaisSchema.array().parse(response);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error fetching paises:", error);
    return NextResponse.json(
      { error: "Failed to fetch paises" },
      { status: 500 }
    );
  }
}
