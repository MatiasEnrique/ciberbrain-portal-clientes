import { paisSchema, partidoSchema, provinciaSchema } from "./schemas";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function getPaises() {
  const response: z.infer<typeof paisSchema>[] =
    await prisma.$queryRaw`Select id, pais FROM CC_Paises WHERE Activo = 1 Order by Pais`;

  const parsedResponse = paisSchema.array().parse(response);

  return parsedResponse;
}

export async function getProvincias(pais: string) {
  const response = await prisma.$queryRaw`
    SELECT id, provincia 
    FROM CC_Provincias 
    WHERE Pais = ${pais} 
    ORDER BY provincia
  `;

  const parsedResponse = provinciaSchema.array().parse(response);

  return parsedResponse;
}

export async function getPartidos(provincia: string) {
  const response = await prisma.$queryRaw`
    SELECT id, partido 
    FROM CC_Partidos 
    WHERE Provincia = ${provincia} 
    ORDER BY partido
  `;

  const parsedResponse = partidoSchema.array().parse(response);

  return parsedResponse;
}
