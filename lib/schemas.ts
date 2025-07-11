import { registerSchema } from "@/app/(public)/auth/registrarse/schemas";
import * as z from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Email invalido" }),
  password: z.string().min(4, { message: "Contraseña invalida" }),
});

export const productSchema = z.object({
  ID: z.number(),
  FechaAlta: z.coerce.date().nullable(),
  Codigo: z.string(),
  Descripcion: z.string(),
  Marca: z.number(),
  NroSerie: z.string(),
  Comercio: z.string(),
  FacturaCompra: z.string(),
  FechaCompra: z.coerce.date().nullable(),
  Agrupacion: z.number(),
  Bloque: z.number(),
  Anulado: z.null(),
  IDComercio: z.number(),
  MesesGarantia: z.number(),
  MesesPremio: z.number(),
  Ubicacion: z.string(),
  IDUsuario: z.number(),
  IDArticulo: z.number(),
  TieneImagen: z.coerce.boolean(),
  Imagen: z.any(),
  NombreMarca: z.string().nullable().optional(),
});

export type Product = z.infer<typeof productSchema>;

export const documentSchema = z.object({
  ID: z.number(),
  Descripcion: z.string(),
  UNC: z.string(),
});

export type Document = z.infer<typeof documentSchema>;

export const marcaSchema = z.object({
  Codigo: z.number(),
  Marca: z.string(),
});

export type Marca = z.infer<typeof marcaSchema>;

export const modeloSchema = z.object({
  Codigo: z.string(),
  Descripcion: z.string(),
});

export type Modelo = z.infer<typeof modeloSchema>;

export const profileSchema = registerSchema._def.schema.omit({
  password: true,
  confirmPassword: true,
  session: true,
  profile: true,
});

export type ProfileSchemaType = z.infer<typeof profileSchema>;

export const PaisSchema = z.object({
  id: z.number(),
  pais: z.string(),
});
export type PaisSchemaType = z.infer<typeof PaisSchema>;

export const ProvinciaSchema = z.object({
  id: z.number(),
  provincia: z.string(),
});
export type ProvinciaSchemaType = z.infer<typeof ProvinciaSchema>;

export const PartidoSchema = z.object({
  id: z.number(),
  partido: z.string(),
});
export type PartidoSchemaType = z.infer<typeof PartidoSchema>;
