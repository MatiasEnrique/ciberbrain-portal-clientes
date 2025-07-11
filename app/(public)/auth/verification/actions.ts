import { prisma } from "@/lib/prisma";

export async function verificarRegistracion(session: string) {
  try {
    const result: { nombre: string; returnVal: string }[] =
      await prisma.$queryRaw`
        DECLARE @Nombre VARCHAR(100);
        DECLARE @ReturnVal INT;
        EXEC @ReturnVal = WP_Autorizar_Registracion 
        @SesionOrigen = ${session},
        @Accion = ${1},
        @Nombre = @Nombre OUTPUT;
        SELECT @Nombre as nombre, @ReturnVal as returnVal;
    `;

    if (result[0].nombre) {
      return {
        success: true,
        nombre: result[0].nombre,
      };
    }
  } catch (error) {
    console.error("Error verifying registration:", error);
    return {
      success: false,
      error: "Error al verificar la registración",
    };
  }
}
