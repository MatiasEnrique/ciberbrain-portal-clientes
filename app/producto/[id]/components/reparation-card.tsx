import { Product } from "@/lib/schemas";
import {
  canGenerateOrder,
  getOpcionesAsistencia,
  getProducto,
  getProductReparations,
} from "../data";
import GenerateReparationForm from "./generate-reparation-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function ReparationCard({
  id,
  user_id,
}: {
  id: string;
  user_id: string;
}) {
  const [politicas, opciones, producto] = await Promise.all([
    canGenerateOrder(user_id, id),
    getOpcionesAsistencia(id, user_id),
    getProducto(id, user_id),
  ]);

  if (politicas.length == 0 || !producto) {
    return null;
  }

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold tracking-tight text-center">
            Generar Nueva Solicitud de Servicio
          </h2>
        </CardHeader>
        <CardContent>
          <GenerateReparationForm
            opcionesAsistencia={opciones}
            politicas={politicas}
            producto={producto}
          />
        </CardContent>
      </Card>
    </div>
  );
}
