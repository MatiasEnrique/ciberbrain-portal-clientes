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
  ID: z.number(),
  Pais: z.string(),
});
export type PaisSchemaType = z.infer<typeof PaisSchema>;

export const ProvinciaSchema = z.object({
  ID: z.number(),
  Provincia: z.string(),
});
export type ProvinciaSchemaType = z.infer<typeof ProvinciaSchema>;

export const PartidoSchema = z.object({
  ID: z.number(),
  Partido: z.string(),
});
export type PartidoSchemaType = z.infer<typeof PartidoSchema>;

export const LocalidadSchema = z.object({
  ID: z.number(),
  Localidad: z.string(),
});
export type LocalidadSchemaType = z.infer<typeof LocalidadSchema>;

// Product validation schemas
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

// Product policy and reparation schemas
export const politicaSchema = z.object({
  IDPolitica: z.number(),
  Politica: z.string(),
  Inicio: z.date(),
  MesesProducto: z.number(),
  MesesPremios: z.number(),
  MesesTotales: z.number(),
  Fin: z.date(),
  Garantia: z.number(),
  TrabajoPendiente: z.null(),
  PoliticaAsistencia: z.number(),
});
export type Politica = z.infer<typeof politicaSchema>;

export const opcionesAsistenciaSchema = z.object({
  id: z.number(),
  Opcion: z.string(),
  Fecha: z.coerce.boolean(),
  IDSuceso: z.number().nullable(),
});
export type OpcionesAsistencia = z.infer<typeof opcionesAsistenciaSchema>;

export const reparationSchema = z.object({
  IDTrabajo: z.number(),
  FechaAlta: z.date(),
  Estado: z.string(),
  Responsable: z.string(),
  IDPolitica: z.number(),
  EstadoGeneral: z.number(),
});
export type Reparation = z.infer<typeof reparationSchema>;
