import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WorkOrderDetails } from "./components/work-order-details";

export default async function WorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return redirect("/auth/login");
  }

  return (
    <div className="container mx-auto py-6">
      <WorkOrderDetails workOrderId={id} />
    </div>
  );
}
