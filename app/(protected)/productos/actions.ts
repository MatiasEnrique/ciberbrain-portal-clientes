"use server";

import { prisma, executeWithUserValidation } from "@/lib/prisma";
import { Prisma } from "@/prisma/@/generated/prisma";
import { auth } from "@/auth";
import {
  validateModeloSchema,
  ValidarModelo,
  validateSerieSchema,
  ValidarSerie,
  Comercio,
  comercioSchema,
} from "@/lib/schemas";
import { RegisterProductPayload } from "./schemas";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

export async function validateModelo(
  marca: string,
  modelo: string
): Promise<{ error?: string; data?: ValidarModelo }> {
  const session = await auth();

  if (!session?.user) {
    console.error("Unauthorized attempt to validate modelo.");
    return { error: "Unauthorized" };
  }

  try {
    const result: unknown = await executeWithUserValidation(
      Prisma.sql`dbo.WP_ValidarModelo @Modelo = ${modelo}, @Marca = ${marca}`
    );

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return {
        error: `Modelo ${modelo} no encontrado.`,
      };
    }

    const dataToParse = Array.isArray(result) ? result[0] : result;
    const parsedResult = validateModeloSchema.safeParse(dataToParse);

    if (parsedResult.success) {
      return { data: parsedResult.data };
    } else {
      return { error: "Formato de modelo inválido." };
    }
  } catch (error) {
    console.error("Database or unexpected error in validateModelo:", error);
    return { error: "Error al validar el modelo en el servidor." };
  }
}

export async function validateSerie(
  modelo: string,
  nroSerie: string
): Promise<{ error?: string; data?: ValidarSerie }> {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const result: unknown = await executeWithUserValidation(
      Prisma.sql`dbo.WP_ValidarNroSerie @Modelo = ${modelo}, @NroSerie = ${nroSerie}`
    );

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return {
        error: `Serie ${nroSerie} no encontrada.`,
      };
    }

    const dataToParse = Array.isArray(result) ? result[0] : result;

    const parsedResult = validateSerieSchema.safeParse(dataToParse);

    if (parsedResult.success) {
      return { data: parsedResult.data };
    } else {
      return { error: "Formato de serie inválido." };
    }
  } catch (error) {
    console.error("Database or unexpected error in validateSerie:", error);
    return { error: "Error al validar la serie en el servidor." };
  }
}

export const validateComercio = async (
  comercio: string
): Promise<{ error?: string; data?: Comercio }> => {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const result: unknown = await executeWithUserValidation(
      Prisma.sql`SELECT ID, Comercio FROM CS_Comercios WHERE Comercio = ${comercio}`
    );

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return {
        error: `Comercio ${comercio} no encontrado.`,
      };
    }

    const dataToParse = Array.isArray(result) ? result[0] : result;

    const parsedResult = comercioSchema.safeParse(dataToParse);

    if (parsedResult.success) {
      return { data: parsedResult.data };
    } else {
      return { error: "Formato de comercio inválido." };
    }
  } catch (error) {
    console.error("Database or unexpected error in validateComercio:", error);
    return { error: "Error al validar el comercio en el servidor." };
  }
};

export const registerProduct = async (producto: RegisterProductPayload) => {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await executeWithUserValidation(
      Prisma.sql`
        DECLARE @ReturnValue int;
        EXEC @ReturnValue = dbo.WP_RegistraProducto
          @IDUsuario = ${parseInt(session.user.id)},
          @Ubicacion = ${producto.ubicacion ?? "Generica"},
          @Descripcion = ${producto.descripcion},
          @Codigo = ${producto.codigo},
          @NroSerie = ${producto.nroSerie},
          @Comercio = ${producto.comercio},
          @IDComercio = ${0},
          @FacturaCompra = ${producto.facturaCompra},
          @FechaCompra = ${producto.fechaCompra},
          @MesesAdicionales = ${0};
        SELECT @ReturnValue as id;
      `
    );

    const productRegistrationResult = result as Array<{ id: number }>;
    if (
      !productRegistrationResult ||
      productRegistrationResult.length === 0 ||
      !productRegistrationResult[0] ||
      typeof productRegistrationResult[0].id !== "number"
    ) {
      console.error(
        "Error: WP_RegistraProducto did not return a valid product ID.",
        productRegistrationResult
      );
      return { error: "Error al obtener el ID del producto registrado." };
    }
    const nuevoProductoId = productRegistrationResult[0].id;

    if (producto.fotoFacturaCompra) {
      await insertImagen(
        nuevoProductoId,
        "ProductoRegistrado",
        "Foto Factura Compra",
        8,
        producto.fotoFacturaCompra
      );
    }
    revalidatePath("/productos");

    return {
      data: true,
    };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2010" &&
      "meta" in error &&
      typeof (error as any).meta === "object" &&
      (error as any).meta !== null &&
      "message" in (error as any).meta &&
      typeof (error as any).meta.message === "string"
    ) {
      const dbErrorMessage = (error as any).meta.message
        .replace(/^(\[.*?\])+/, "")
        .trim();
      console.error("Stored procedure error:", dbErrorMessage);
      return { error: dbErrorMessage };
    }

    console.error("Error registering product:", error);
    return { error: "Error al registrar el producto en el servidor." };
  }
};

async function insertImagen(
  idOrigen: number,
  fileType: string,
  descripcion: string,
  categoria: number,
  file: File
) {
  try {
    if (!file || typeof file.arrayBuffer !== "function") {
      throw new Error("Archivo no válido");
    }

    const [nombre, extension] = file.name.split(".");

    const resultID: { id: number }[] = await prisma.$queryRaw(
      Prisma.sql`SELECT COALESCE(MAX(ID) + 1, 1) AS id FROM CC_Documentacion`
    );

    const nextId = resultID[0].id;

    if (!nextId) throw new Error("No se pudo obtener el próximo ID");

    const finalFileName = `${nombre}_${nextId}.${extension}`;
    const uploadBasePath = process.env.UPLOAD_PATH;
    if (!uploadBasePath) throw new Error("UPLOAD_PATH no definido");

    const fullPath = path.join(uploadBasePath, finalFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    await prisma.$executeRawUnsafe(`
      DECLARE @r INT;
      EXEC @r = CC_InsertarDocumentoAdjunto
        @Relacion = '${fileType}',
        @IDOrigen = ${idOrigen},
        @Descripcion = '${descripcion}',
        @UNC = '${finalFileName}',
        @Categoria = ${categoria};
    `);

    return { ok: true, nombre: finalFileName };
  } catch (err) {
    console.error("Error inserting image:", err);
    return { ok: false, error: "Error" };
  }
}
