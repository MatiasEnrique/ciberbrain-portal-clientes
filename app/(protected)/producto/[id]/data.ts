"server-only";

import {
  opcionesAsistenciaSchema,
  politicaSchema,
  reparationSchema,
} from "./schemas";
import { executeWithUserValidation, prisma } from "@/lib/prisma";
import { Product, productSchema } from "@/lib/schemas";
import { getProductImage } from "../../productos/data";
import { Prisma } from "@/prisma/@/generated/prisma";

export async function getProducto(id: string, id_usuario: string) {
  try {
    const query: Product[] = await prisma.$queryRaw`
  exec WP_Datos_Producto @IDUsuario = ${id_usuario}, @IDProducto = ${id}
  `;

    if (query.length === 0) {
      return null;
    }

    const product = productSchema.parse(query[0]);

    if (product.TieneImagen) {
      const imageBuffer = await getProductImage(product.IDArticulo);

      if (imageBuffer) {
        product.Imagen = `data:image/jpeg;base64,${imageBuffer.toString(
          "base64"
        )}`;
      } else {
        product.Imagen = null;
      }
    }

    const marca = await prisma.marca.findFirst({
      where: {
        codigo: product.Marca,
      },
    });

    product.NombreMarca = marca?.descripcion;

    return product;
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    throw error;
  }
}

export async function canGenerateOrder(
  id_usuario: string,
  id_producto: string
) {
  try {
    const query = await executeWithUserValidation(
      Prisma.sql`exec WP_GenerarOS @IDUsuario = ${id_usuario}, @IDProducto = ${id_producto}`
    );

    const politicas = politicaSchema.array().parse(query);

    return politicas;
  } catch (error) {
    console.error("Error in canGenerateOrder:", error);
    return [];
  }
}

export async function getDocumentosModelo(id_producto: string) {
  try {
    const query = await executeWithUserValidation(
      Prisma.sql`exec WP_Traer_Documentos_Modelo @IDProducto = ${id_producto}`
    );

    return query as [];
  } catch (error) {
    console.error("Error in getDocumentosModelo:", error);
    return [];
  }
}

export async function getOpcionesAsistencia(
  id_producto: string,
  id_usuario: string
) {
  try {
    const query = await executeWithUserValidation(
      Prisma.sql`exec WP_Traer_Opciones_Asistencia @IDProducto = ${id_producto}, @IDUsuario = ${id_usuario}, @Momento = 1`
    );

    const parsed = opcionesAsistenciaSchema.array().parse(query);

    return parsed;
  } catch (error) {
    console.error("Error in getOpcionesAsistencia:", error);
    return [];
  }
}

export async function getProductReparations(
  id_producto: string,
  id_usuario: string
) {
  try {
    const query = await executeWithUserValidation(
      Prisma.sql`exec WP_Traer_Reparaciones_Producto @IDUsuario = ${id_usuario}, @IDProducto = ${id_producto}`
    );

    const reparations = reparationSchema.array().parse(query);

    return reparations;
  } catch (error) {
    console.error("Error in getReparations:", error);
    return [];
  }
}
