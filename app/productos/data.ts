import { prisma, executeWithUserValidation } from "@/lib/prisma";
import { Prisma } from "@/prisma/@/generated/prisma";
import {
  documentSchema,
  marcaSchema,
  modeloSchema,
  productSchema,
} from "@/lib/schemas";
import { HasComercios, hasComerciosSchema } from "@/lib/schemas";

export async function getUserProducts(userId: string) {
  const products = await executeWithUserValidation(
    Prisma.sql`SELECT * FROM dbo.WP_Productos_Usuario(${userId})`
  );

  const parsedProducts = productSchema.array().parse(products);

  const productDataPromises = parsedProducts.map(async (product) => {
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

    return product;
  });

  await Promise.all(productDataPromises);

  return parsedProducts.sort((a, b) => {
    if (!a.FechaAlta || !b.FechaAlta) return 0;
    return new Date(b.FechaAlta).getTime() - new Date(a.FechaAlta).getTime();
  });
}

export async function getProductImage(id: number) {
  const image = await prisma.imagen.findFirst({
    where: {
      ID: id,
      Tipo: 1,
    },
  });

  if (!image?.Imagen) {
    return null;
  }

  const buffer = Buffer.from(image?.Imagen);

  return buffer;
}

export async function getMarcas() {
  const marcas = await executeWithUserValidation(
    Prisma.sql`dbo.WP_TraerMarcas @IDUsuario = 0`
  );

  const parsedMarcas = marcaSchema.array().parse(marcas);

  return parsedMarcas.filter((m) => m.Marca);
}

export async function getModelos(marca: string, modelo: string) {
  const modelos = await executeWithUserValidation(
    Prisma.sql`dbo.WP_au_Modelo ${modelo}, ${marca}`
  );

  const parsedModelos = modeloSchema.array().parse(modelos);

  return parsedModelos;
}

export async function getHasComercios() {
  const hasComercios = (await executeWithUserValidation(
    Prisma.sql`dbo.WP_Datos_Comercios`
  )) as HasComercios;

  const parsedHasComercios = hasComerciosSchema.parse(hasComercios);

  return parsedHasComercios;
}
