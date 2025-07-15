import { auth } from "@/auth";
import { ExtendedUser as User } from "@/types/next-auth";

export interface FeatureFlags {
  RED_AGENTES: boolean;
  ASISTENCIA: boolean;
  COMPRA_REPUESTOS: boolean;
  CHAT: boolean;
  MANUALES: boolean;
  CONSEJOS_UTILES: boolean;
  PREGUNTAS_FRECUENTES: boolean;
  POSTULACION_AGENTE: boolean;
}

function getFeatureFlags(): FeatureFlags {
  return {
    RED_AGENTES: process.env.RED_AGENTES === "true",
    ASISTENCIA: process.env.ASISTENCIA === "true",
    COMPRA_REPUESTOS: process.env.COMPRA_REPUESTOS === "true",
    CHAT: process.env.CHAT === "true",
    MANUALES: process.env.MANUALES === "true",
    CONSEJOS_UTILES: process.env.CONSEJOS_UTILES === "true",
    PREGUNTAS_FRECUENTES: process.env.PREGUNTAS_FRECUENTES === "true",
    POSTULACION_AGENTE: process.env.POSTULACION_AGENTE === "true",
  };
}

export function isAdmin(user: User | undefined): boolean {
  return user?.id === "1";
}

export async function hasPermission(
  feature: keyof FeatureFlags
): Promise<boolean> {
  const session = await auth();
  const flags = getFeatureFlags();
  const user = session?.user;

  switch (feature) {
    case "RED_AGENTES":
      return flags.RED_AGENTES;

    case "ASISTENCIA":
      return (!!session && flags.ASISTENCIA) || isAdmin(user);

    case "COMPRA_REPUESTOS":
      return !!session && flags.COMPRA_REPUESTOS;

    case "CHAT":
      return !!session && flags.CHAT;

    case "MANUALES":
      return !!session && flags.MANUALES;

    case "CONSEJOS_UTILES":
      return flags.CONSEJOS_UTILES;

    case "PREGUNTAS_FRECUENTES":
      return flags.PREGUNTAS_FRECUENTES;

    case "POSTULACION_AGENTE":
      return (
        !!session &&
        flags.POSTULACION_AGENTE &&
        (user?.perfil === 3 || isAdmin(user))
      );

    default:
      return false;
  }
}

export function getFeatureFlag(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

export async function requirePermission(
  feature: keyof FeatureFlags
): Promise<boolean> {
  const hasAccess = await hasPermission(feature);
  if (!hasAccess) {
    throw new Error(`Access denied: ${feature} permission required`);
  }
  return true;
}
