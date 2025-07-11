"use client";

import { useState, useEffect } from "react";
import { Search, Package, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProducts } from "../data";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ProductForm from "./product-form";
import { Product, productSchema } from "@/lib/schemas";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import ProductsSkeleton from "./products-skeleton";
import Link from "next/link";

interface ProductsClientProps {
  userId: string;
}

export default function ProductsClient({ userId }: ProductsClientProps) {
  const queryClient = useQueryClient();
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`/api/productos`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      const parsedProducts = productSchema.array().parse(result);

      return parsedProducts;
    },
    enabled: !!userId,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    setFilteredProducts(
      products?.filter(
        (product) =>
          product.Descripcion.toLowerCase().includes(
            debouncedSearchTerm.toLowerCase()
          ) ||
          product.Codigo.toLowerCase().includes(
            debouncedSearchTerm.toLowerCase()
          )
      ) || []
    );
  }, [products, debouncedSearchTerm]);

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:min-w-[450px] sm:max-w-[33vw]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              <DialogDescription>
                Completa la información del producto para registrarlo en tu
                inventario.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              userId={userId}
              onFormSubmitSuccess={() => setIsDialogOpen(false)}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar productos por descripción o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No se encontraron productos
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Comienza agregando tu primer producto"}
          </p>
          {!searchTerm && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Primer Producto
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.ID} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/producto/${product.ID}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative px-4">
          <Image
            src={`${product.Imagen}`}
            alt={product.Descripcion}
            className="object-contain max-h-64"
            width={500}
            height={500}
            loader={({ src, width, quality }) => {
              return `${src}?w=${width}&q=${quality || 75}`;
            }}
          />
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="">{product.Descripcion}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Codigo: </span>
            <span className="font-medium">{product.Codigo}</span>
            <span className="text-muted-foreground">Marca (ID):</span>
            <span className="font-medium">{product.Marca}</span>
            <span className="text-muted-foreground">Serie:</span>
            <span className="font-medium">{product.NroSerie}</span>

            <span className="text-muted-foreground">Comercio:</span>
            <span className="font-medium">{product.Comercio}</span>

            <span className="text-muted-foreground">Factura:</span>
            <span className="font-medium ">{product.FacturaCompra}</span>

            <span className="text-muted-foreground">Compra:</span>
            <span className="font-medium">
              {product.FechaCompra
                ? new Date(product.FechaCompra).toLocaleDateString("es-ES")
                : "No registrado"}
            </span>
          </div>

          <Badge variant="secondary" className="w-fit">
            Registrado
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
