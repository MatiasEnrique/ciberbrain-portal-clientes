import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = requestSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        SessionOrigen: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Token inválido o expirado",
        },
        { status: 400 }
      );
    }

    if (user.EstadoRegistracion !== 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Tu cuenta aún no ha sido verificada",
        },
        { status: 400 }
      );
    }

    // Update password
    await prisma.user.update({
      where: {
        ID: user.ID,
      },
      data: {
        Password: password,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Tu contraseña ha sido actualizada exitosamente. Redirigiendo al inicio de sesión...",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos inválidos",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Ha ocurrido un error al actualizar la contraseña",
      },
      { status: 500 }
    );
  }
}
