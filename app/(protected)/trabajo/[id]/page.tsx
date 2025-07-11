import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ReparationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  return (
    <div>
      <h1>ReparationPage {id}</h1>
    </div>
  );
}
