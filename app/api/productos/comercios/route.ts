import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { comercioSchema } from "@/app/productos/schemas";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search");

    if (!searchTerm) {
      return new NextResponse("Search term is required", { status: 400 });
    }

    const comercios = await prisma.$queryRaw`
      SELECT TOP 15 ID, Comercio 
      FROM CS_Comercios 
      WHERE Comercio LIKE ${`%${searchTerm}%`}
    `;

    const parsedComercios = comercioSchema.array().parse(comercios);

    return NextResponse.json(parsedComercios);
  } catch (error) {
    console.error("Error fetching comercios:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
