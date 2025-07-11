import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return redirect("/auth/login");
  }

  return (
    <div>
      hola {JSON.stringify(session)}
      <LogoutButton />
    </div>
  );
}
