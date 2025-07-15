import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const perfil = parseInt(session?.user?.id || "0");

    const categories = await prisma.$queryRaw<
      Array<{
        Categoria: string;
      }>
    >`
      EXEC WP_TraerCategoriasPreguntas @Perfil = ${perfil}
    `;

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching FAQ categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQ categories" },
      { status: 500 }
    );
  }
}
