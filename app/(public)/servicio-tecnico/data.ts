import { prisma } from "@/lib/prisma";
import { PartidoSchema, PaisSchema, ProvinciaSchema } from "@/lib/schemas";

export async function getAgrupaciones() {
  try {
    const result = await prisma.$queryRaw<
      Array<{ ID: number; Agrupacion: string }>
    >`EXEC WP_AgrupacionesAgentes`;
    return result;
  } catch (error) {
    console.error("Error fetching agrupaciones:", error);
    return [];
  }
}

export async function getPaises() {
  try {
    const result =
      await prisma.$queryRaw`SELECT ID, Pais FROM CC_Paises WHERE Activo = 1 ORDER BY Pais`;

    const parsedResult = PaisSchema.array().parse(result);

    return parsedResult;
  } catch (error) {
    console.error("Error fetching paises:", error);
    return [];
  }
}

export async function getProvincias(paisId: number) {
  try {
    const result = await prisma.$queryRaw<
      Array<{ ID: number; Provincia: string }>
    >`SELECT ID, Provincia FROM CC_Provincias WHERE IDPais = ${paisId} ORDER BY Provincia`;

    const parsedResult = ProvinciaSchema.array().parse(result);

    return parsedResult;
  } catch (error) {
    console.error("Error fetching provincias:", error);
    return [];
  }
}

export async function getPartidos(provinciaId: number) {
  try {
    const result = await prisma.$queryRaw<
      Array<{ ID: number; Partido: string }>
    >`SELECT ID, Partido FROM CC_Partidos WHERE IDProvincia = ${provinciaId} ORDER BY Partido`;

    const parsedResult = PartidoSchema.array().parse(result);

    return parsedResult;
  } catch (error) {
    console.error("Error fetching partidos:", error);
    return [];
  }
}

export async function getLocalidades(partidoId: number) {
  try {
    const result = await prisma.$queryRaw<
      Array<{ ID: number; Localidad: string }>
    >`SELECT ID, Localidad FROM CC_Localidades WHERE IDPartido = ${partidoId} ORDER BY Localidad`;
    return result;
  } catch (error) {
    console.error("Error fetching localidades:", error);
    return [];
  }
}

export async function getAgentes(
  lineaId: number,
  provinciaId: number,
  partidoId: number,
  localidadId: number
) {
  try {
    const result = await prisma.$queryRaw<
      Array<{
        Cliente: string;
        Domicilio: string;
        Otros: string;
        Localidad: string;
        Provincia: string;
        Telefonos: string;
        Email: string;
        HorarioComercial: string;
      }>
    >`EXEC WP_AgentesProductoyZona @Agrupacion = ${lineaId}, @Provincia = ${provinciaId}, @Partido = ${partidoId}, @Localidad = ${localidadId}`;
    return result;
  } catch (error) {
    console.error("Error fetching agentes:", error);
    return [];
  }
}
