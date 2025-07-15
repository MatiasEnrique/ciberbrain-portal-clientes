"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConsumerAction {
  ID: number;
  URL: string;
  Descripcion: string | null;
}

interface ConsumerActionsProps {
  acciones: ConsumerAction[];
}

export function ConsumerActions({ acciones }: ConsumerActionsProps) {
  if (acciones.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {acciones.map((accion) => (
            <div key={accion.ID} className="p-2 border rounded">
              <div 
                dangerouslySetInnerHTML={{ __html: accion.URL }}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}