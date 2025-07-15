import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface WorkOrderData {
  trabajo: {
    IDTrabajo: number;
    EstadoGeneral: number;
    Encuesta: number;
    Comentarios: string | null;
    Mostrar: string | null;
    Titulo: string | null;
    Descripcion: string | null;
    FechaAlta: string | null;
    FechaCierre: string | null;
    user: {
      ID: number;
      Nombre: string | null;
      Apellido: string | null;
      EMail: string | null;
    } | null;
    sucesos: Array<{
      ID: number;
      Fecha: string;
      Suceso: string;
      Comentarios: string | null;
      Tarea: number | null;
      IDSucesoCancela: number | null;
    }>;
  };
  encuestaPreguntas: Array<{
    ID: number;
    Pregunta: string;
    Respuesta: boolean;
    Orden: number | null;
  }>;
  encuestaConceptos: Array<{
    ID: number;
    Concepto: string;
    Conformidad: number | null;
    Orden: number | null;
  }>;
  acciones: Array<{
    ID: number;
    URL: string;
    Descripcion: string | null;
  }>;
  formatosImpresion: Array<{
    ID: number;
    Formato: string;
    Tipo: number;
  }>;
  tiposSucesos: Array<{
    ID: number;
    Suceso: string;
    Descripcion: string | null;
  }>;
}

export function useTrabajoData(workOrderId: string) {
  return useQuery({
    queryKey: ["trabajo", workOrderId],
    queryFn: async (): Promise<WorkOrderData> => {
      const response = await fetch(`/api/trabajo/${workOrderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch work order data");
      }
      return response.json();
    },
    enabled: !!workOrderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useSubmitSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workOrderId,
      answers,
    }: {
      workOrderId: number;
      answers: Record<string, boolean | number>;
    }) => {
      const response = await fetch(`/api/trabajo/${workOrderId}/encuesta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers),
      });
      if (!response.ok) {
        throw new Error("Failed to submit survey");
      }
      return response.json();
    },
    onSuccess: (_, { workOrderId }) => {
      queryClient.invalidateQueries({
        queryKey: ["trabajo", workOrderId.toString()],
      });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workOrderId,
      eventData,
    }: {
      workOrderId: number;
      eventData: {
        tipoSuceso: number;
        comentarios: string;
      };
    }) => {
      const response = await fetch(`/api/trabajo/${workOrderId}/suceso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create event";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorData?.message || errorMessage;
          if (errorData?.details) {
            errorMessage += `: ${errorData.details}`;
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (_, { workOrderId }) => {
      queryClient.invalidateQueries({
        queryKey: ["trabajo", workOrderId.toString()],
      });
    },
  });
}
