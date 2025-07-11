import * as z from "zod";

export const validateModeloSchema = z.object({
  Codigo: z.string(),
  DescripcionReducida: z.string(),
  Marca: z.number(),
});

export type ValidarModelo = z.infer<typeof validateModeloSchema>;

export const validateSerieSchema = z.object({
  Modelo: z.string(),
  NroSerie: z.string(),
  Resultado: z.number(),
});

export type ValidarSerie = z.infer<typeof validateSerieSchema>;

export const comercioSchema = z.object({
  ID: z.number(),
  Comercio: z.string(),
  CodCli: z.string(),
  Sucursal: z.string(),
});

export type Comercio = z.infer<typeof comercioSchema>;

export const hasComerciosSchema = z.object({
  SoloLista: z.boolean(),
  Cantidad: z.number(),
});

export type HasComercios = z.infer<typeof hasComerciosSchema>;

export const registerProductSchema = z.object({
  ubicacion: z.string().nullable(),
  codigo: z.string(),
  descripcion: z.string(),
  nroSerie: z.string(),
  comercio: z.string().nullable(),
  idComercio: z.number(),
  facturaCompra: z.string(),
  fechaCompra: z.date(),
  mesesAdicionales: z.number(),
  marca: z.number(),
  fotoFacturaCompra: z.instanceof(File).nullable(),
});

export type RegisterProductPayload = z.infer<typeof registerProductSchema>;
