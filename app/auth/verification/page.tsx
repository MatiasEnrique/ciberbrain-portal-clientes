import Link from "next/link";
import { verificarRegistracion } from "./actions";
import { buttonVariants } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ session: string }>;
}) {
  const { session } = await searchParams;

  const result = await verificarRegistracion(session);

  if (result?.error) {
    return <div>{result.error}</div>;
  }

  return redirect("/auth/login?verification=success");
}
