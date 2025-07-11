"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function ProductCard({
  product_id,
  user_id,
}: {
  product_id: string;
  user_id: string;
}) {
  const {
    data: product,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["producto", product_id, user_id],
    queryFn: async () => {
      const res = await fetch(`/api/producto/${product_id}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al obtener el producto");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="relative mx-auto w-full max-w-sm aspect-video bg-muted animate-pulse rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[120px_1fr] items-center gap-2"
              >
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.Descripcion}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {product.TieneImagen && product.Imagen && (
          <div className="relative mx-auto w-full max-w-sm aspect-video">
            <Image
              src={`${product.Imagen}`}
              alt={product.Descripcion}
              className="object-contain rounded-md"
              fill
              loader={({ src, width, quality }) => {
                return `${src}?w=${width}&q=${quality || 75}`;
              }}
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Código</span>
            <span className="font-medium">{product.Codigo}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Nro. de Serie</span>
            <span className="font-medium">{product.NroSerie}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Marca</span>
            <span className="font-medium">{product.NombreMarca}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Comercio</span>
            <span className="font-medium">{product.Comercio}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Factura</span>
            <span className="font-medium">{product.FacturaCompra}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Fecha Compra</span>
            <span className="font-medium">
              {product.FechaCompra
                ? new Date(product.FechaCompra).toLocaleDateString("es-ES")
                : "No registrada"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Garantía</span>
            <span className="font-medium">{product.MesesGarantia} meses</span>
          </div>
          <div>
            <span className="text-muted-foreground block">
              Garantia extendida
            </span>
            <span className="font-medium">{product.MesesPremio} meses</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Ubicación</span>
            <span className="font-medium">
              {product.Ubicacion ? product.Ubicacion : "-"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Fecha de Alta</span>
            <span className="font-medium">
              {product.FechaAlta
                ? new Date(product.FechaAlta).toLocaleDateString("es-ES")
                : "No registrada"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
