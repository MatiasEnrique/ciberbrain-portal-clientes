import { z } from "zod";

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

export const generateReparationSchema = z.object({
  ID: z.number(),
  fecha: z.date().optional(),
  politica: z.number(),
  descripcion: z.string(),
  opcion_asistencia: z.number(),
});

export type GenerateReparation = z.infer<typeof generateReparationSchema>;

export const opcionesAsistenciaSchema = z.object({
  id: z.number(),
  Opcion: z.string(),
  Fecha: z.coerce.boolean(),
  IDSuceso: z.number().nullable(),
});

export const reparationSchema = z.object({
  IDTrabajo: z.number(),
  FechaAlta: z.date(),
  Estado: z.string(),
  Responsable: z.string(),
  IDPolitica: z.number(),
  EstadoGeneral: z.number(),
});

export type Reparation = z.infer<typeof reparationSchema>;
