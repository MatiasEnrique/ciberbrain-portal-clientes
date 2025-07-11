import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PerfilForm from "./components/perfil-form";
import { prisma } from "@/lib/prisma";
import { getPaises } from "@/app/(public)/auth/registrarse/data";

export default async function PerfilPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  if (!session.user) {
    return <div>No se encontró el perfil del usuario.</div>;
  }
  const user = await prisma.user.findUnique({
    where: {
      ID: parseInt(session.user.id),
    },
  });

  if (!user) {
    return <div>No se encontró el perfil del usuario.</div>;
  }

  const paises = await getPaises();

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center mb-8">
        <PerfilForm user={user} paises={paises} />
      </div>
    </div>
  );
}
