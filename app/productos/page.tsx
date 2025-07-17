import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProductsClient from "./components/products-client";
import { getHasComercios, getMarcas, getUserProducts } from "./data";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function ProductsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: () => getUserProducts(session.user!.id),
  });

  await queryClient.prefetchQuery({
    queryKey: ["marcas"],
    queryFn: () => getMarcas(),
  });

  await queryClient.prefetchQuery({
    queryKey: ["hasComercios"],
    queryFn: () => getHasComercios(),
  });

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tus Productos</h1>
          <p className="text-muted-foreground">
            Bienvenido, {session.user.firstname + " " + session.user.lastname}.
            Gestiona y visualiza todos tus productos registrados.
          </p>
        </div>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsClient userId={session.user.id} />
      </HydrationBoundary>
    </div>
  );
}
