import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Reparaciones() {
  const session = await auth();

  if (!session || !session.user) {
    return redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center mb-8">
        <h1 className="text-2xl font-bold">Reparaciones</h1>
      </div>
    </div>
  );
}
