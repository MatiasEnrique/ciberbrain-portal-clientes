import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductReparations } from "../data";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function ReparationHistoryCard({
  id,
  user_id,
}: {
  id: string;
  user_id: string;
}) {
  const reparaciones = await getProductReparations(id, user_id);

  if (reparaciones.length === 0) {
    return null;
  }

  return (
    <Card className="gap-0">
      <CardHeader>
        <CardTitle>Historial de Atencion</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reparaciones.map((reparacion) => (
            <div
              key={reparacion.IDTrabajo}
              className="space-y-2 rounded-lg border p-2"
            >
              <div className="flex flex-col space-y-1 w-full">
                <Link
                  href={`/trabajo/${reparacion.IDTrabajo}`}
                  className={`${buttonVariants({
                    variant: "link",
                  })} w-fit text-left pl-0`}
                >
                  Orden de Servicio N°: {reparacion.IDTrabajo}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Fecha: {new Date(reparacion.FechaAlta).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Responsable: {reparacion.Responsable}
                </p>
              </div>
              <Badge className="h-fit text-xs px-2">{reparacion.Estado}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
