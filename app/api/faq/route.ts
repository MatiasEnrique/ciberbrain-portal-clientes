import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria") || "";

    const session = await auth();
    const perfil = parseInt(session?.user?.id || "0");

    const faqs = await prisma.$queryRaw<
      Array<{
        ID: number;
        Categoria: string;
        Pregunta: string;
        Respuesta: string;
      }>
    >`
      EXEC WP_TraerPreguntasFrecuentas @Categoria = ${categoria}, @Perfil = ${perfil}
    `;

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, id, categoria, pregunta, respuesta } = await request.json();
    const perfil = parseInt(session.user?.id || "0");

    const result = await prisma.$queryRaw<
      Array<{
        Categoria: string;
      }>
    >`
      EXEC WP_ActualizarPreguntaFrecuente 
        @Accion = ${action},
        @ID = ${id || 0},
        @Categoria = ${categoria || ""},
        @Pregunta = ${pregunta || ""},
        @Respuesta = ${respuesta || ""},
        @Perfil = ${perfil}
    `;

    return NextResponse.json({
      success: true,
      data: result,
      message:
        action === "QAdd"
          ? "Pregunta agregada correctamente"
          : action === "QEdit"
          ? "Pregunta actualizada correctamente"
          : "Pregunta eliminada correctamente",
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}
