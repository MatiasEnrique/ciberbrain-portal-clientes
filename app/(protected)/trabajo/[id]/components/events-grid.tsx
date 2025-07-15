"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Event {
  ID: number;
  Fecha: string;
  Suceso: string;
  Comentarios: string | null;
  Tarea: number | null;
  IDSucesoCancela: number | null;
}

interface EventsGridProps {
  sucesos: Event[];
}

export function EventsGrid({ sucesos }: EventsGridProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = sucesos.filter(
    (event) =>
      event.Suceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.Comentarios &&
        event.Comentarios.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStyle = (event: Event) => {
    if (event.Tarea && event.Tarea > 0) {
      if (event.IDSucesoCancela && event.IDSucesoCancela > 0) {
        return "text-blue-600";
      } else {
        return "text-red-600";
      }
    }
    return "text-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sucesos</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No se encontraron sucesos" : "Sin Sucesos"}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.ID}
                className={`border rounded-lg p-4 ${getEventStyle(event)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{formatDate(event.Fecha)}</Badge>
                      {event.Tarea && event.Tarea > 0 && (
                        <Badge
                          variant={
                            event.IDSucesoCancela ? "secondary" : "destructive"
                          }
                        >
                          {event.IDSucesoCancela
                            ? "Tarea Cancelada"
                            : "Tarea Activa"}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold mb-1">{event.Suceso}</h4>
                    {event.Comentarios && (
                      <div
                        className="text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: event.Comentarios.replace(/\n/g, "<br />"),
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
