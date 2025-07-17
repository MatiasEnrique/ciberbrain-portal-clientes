import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProducto } from "./data";
import { ProductCard } from "./components/product-card";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import ReparationCard from "./components/reparation-card";
import DocumentsCard from "./components/documents-card";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReparationHistoryCard from "./components/reparation-history";

export default async function Producto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();

  if (!session) {
    return redirect("/auth/login");
  }

  if (!session.user) {
    return redirect("/auth/login");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["producto", id],
    queryFn: () => getProducto(id, session.user?.id!),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Detalle del Producto
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProductCard product_id={id} user_id={session.user?.id!} />
        </HydrationBoundary>
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          }
        >
          <ReparationHistoryCard id={id} user_id={session.user?.id!} />
        </Suspense>
        <Suspense
          fallback={
            <div className="w-full flex justify-center">
              <Card className="w-full mx-auto">
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          }
        >
          <ReparationCard id={id} user_id={session.user?.id!} />
        </Suspense>
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </CardContent>
            </Card>
          }
        >
          <DocumentsCard id={id} user_id={session.user?.id!} />
        </Suspense>
      </div>
    </div>
  );
}
