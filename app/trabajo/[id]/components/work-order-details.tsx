"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EventsGrid } from "./events-grid";
import { SurveySection } from "./survey-section";
import { EventForm } from "./event-form";
import { ConsumerActions } from "./consumer-actions";
import { BudgetSection } from "./budget-section";
import { useTrabajoData } from "@/hooks/use-trabajo";
import { toast } from "sonner";

interface WorkOrderDetailsProps {
  workOrderId: string;
}

export function WorkOrderDetails({ workOrderId }: WorkOrderDetailsProps) {
  const { data, isLoading, error } = useTrabajoData(workOrderId);

  const getStatusBadge = (estado: number) => {
    const statusMap = {
      1: { text: "Para Informar", variant: "secondary" as const },
      2: { text: "En Aprobación", variant: "default" as const },
      3: { text: "En Proceso", variant: "default" as const },
      4: { text: "Terminado", variant: "default" as const },
      5: { text: "Cerrado", variant: "destructive" as const },
      6: { text: "Anulado", variant: "destructive" as const },
    };

    const status = statusMap[estado as keyof typeof statusMap] || {
      text: "Desconocido",
      variant: "secondary" as const,
    };
    return <Badge variant={status.variant}>{status.text}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No especificada";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEventCreated = () => {
    toast.success("Evento creado satisfactoriamente!", {
      action: {
        label: "Ir al inicio",
        onClick: () => {
          window.location.href = `/productos`;
        },
      },
    });
  };

  const handleSurveySubmitted = () => {
    toast.success("Encuesta enviada satisfactoriamente!", {
      action: {
        label: "Ir al inicio",
        onClick: () => {
          window.location.href = `/productos`;
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            {error?.message ||
              "No se pudo cargar la información de la orden de servicio"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { trabajo } = data;
  const isClosed = trabajo.EstadoGeneral > 4;
  const surveyCompleted = trabajo.Encuesta === 1;
  const showSurvey =
    isClosed &&
    !surveyCompleted &&
    (data.encuestaPreguntas.length > 0 || data.encuestaConceptos.length > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Orden de Servicio Nº {trabajo.IDTrabajo}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(trabajo.EstadoGeneral)}
            <span className="text-sm text-muted-foreground">
              Información y seguimiento
            </span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Fecha de Alta:</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(trabajo.FechaAlta)}
              </p>
            </div>
            {trabajo.FechaCierre && (
              <div>
                <h4 className="font-semibold mb-2">Fecha de Cierre:</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(trabajo.FechaCierre)}
                </p>
              </div>
            )}
          </div>

          {trabajo.Mostrar && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Información:</h4>
              <div
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: trabajo.Mostrar }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {showSurvey && (
        <SurveySection
          workOrderId={trabajo.IDTrabajo}
          preguntas={data.encuestaPreguntas}
          conceptos={data.encuestaConceptos}
          onSubmitted={handleSurveySubmitted}
        />
      )}

      {!isClosed &&
        trabajo.EstadoGeneral >= 1 &&
        trabajo.EstadoGeneral <= 2 &&
        data.formatosImpresion.length > 0 && (
          <BudgetSection
            workOrderId={trabajo.IDTrabajo}
            formatos={data.formatosImpresion}
          />
        )}

      {data.acciones.length > 0 && <ConsumerActions acciones={data.acciones} />}

      <EventsGrid sucesos={trabajo.sucesos} />

      {!isClosed && data.tiposSucesos.length > 0 && (
        <EventForm
          workOrderId={trabajo.IDTrabajo}
          tiposSucesos={data.tiposSucesos}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
}
