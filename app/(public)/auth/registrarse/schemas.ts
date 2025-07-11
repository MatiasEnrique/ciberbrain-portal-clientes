import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email({ message: "Email inválido." }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z.string(),
    profile: z.string(),
    dni: z.string().min(7, { message: "DNI inválido." }),
    lastName: z.string().min(1, { message: "Apellido es requerido." }),
    firstName: z.string().min(1, { message: "Nombre es requerido." }),
    country: z.number().min(1, { message: "País es requerido." }),
    province: z.number().min(1, { message: "Provincia es requerida." }),
    partido: z.number().min(1, { message: "Partido es requerido." }),
    city: z.string().min(1, { message: "Localidad es requerida." }),
    postalCode: z.string().min(1, { message: "Código Postal es requerido." }),
    street: z.string().min(1, { message: "Calle es requerida." }),
    streetNumber: z.string().min(1, { message: "Altura es requerida." }),
    otherAddressDetails: z.string().optional(),
    crossStreet1: z.string().optional(),
    crossStreet2: z.string().optional(),
    preferredTime: z.string().optional(),
    session: z.string().optional(),
    birthDate: z
      .string()
      .refine(
        (dateString) =>
          dateString === "" ||
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/.test(dateString),
        {
          message: "Formato de fecha inválido (dd/mm/aaaa) o campo vacío.",
        }
      ),
    phone: z.string().optional(),
    mobilePhone: z.string().min(1, { message: "Celular es requerido." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const paisSchema = z.object({
  pais: z.string(),
  id: z.number(),
});

export type PaisSchemaType = z.infer<typeof paisSchema>;

export const provinciaSchema = z.object({
  id: z.number(),
  provincia: z.string(),
});

export type ProvinciaSchemaType = z.infer<typeof provinciaSchema>;

export const partidoSchema = z.object({
  id: z.number(),
  partido: z.string(),
});

export type PartidoSchemaType = z.infer<typeof partidoSchema>;
