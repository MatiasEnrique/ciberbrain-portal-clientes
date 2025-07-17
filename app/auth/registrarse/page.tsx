import { auth } from "@/auth";
import { GalleryVerticalEnd } from "lucide-react";
import { redirect } from "next/navigation";
import RegisterForm from "./components/register-form";
import { getPaises } from "@/app/servicio-tecnico/data";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/productos");
  }

  const paises = await getPaises();

  return (
    <div className="flex flex-col items-center justify-center gap-6  p-6 md:p-10">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          {process.env.NEXT_PUBLIC_CLIENT_NAME}
        </a>
        <RegisterForm paises={paises} />
      </div>
    </div>
  );
}
