"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AgentSearchForm } from "./agent-search-form";
import { AgentResults } from "./agent-results";
import { toast } from "sonner";
import { PaisSchemaType } from "@/lib/schemas";

type Agrupacion = { ID: number; Agrupacion: string };

type Agent = {
  Cliente: string;
  Domicilio: string;
  Otros: string;
  Localidad: string;
  Provincia: string;
  Telefonos: string;
  Email: string;
  HorarioComercial: string;
};

interface ServicioTecnicoClientProps {
  agrupaciones: Agrupacion[];
  paises: PaisSchemaType[];
}

const fetchAgents = async (params: {
  lineaId: string;
  provinciaId: string;
  partidoId: string;
  localidadId: string;
}): Promise<Agent[]> => {
  const response = await fetch(
    `/api/agentes?lineaId=${params.lineaId}&provinciaId=${params.provinciaId}&partidoId=${params.partidoId}&localidadId=${params.localidadId}`
  );

  if (!response.ok) {
    throw new Error("Error al buscar agentes");
  }

  return response.json();
};

export function ServicioTecnicoClient({
  agrupaciones,
  paises,
}: ServicioTecnicoClientProps) {
  const [searchParams, setSearchParams] = useState<{
    lineaId: string;
    provinciaId: string;
    partidoId: string;
    localidadId: string;
  } | null>(null);

  const {
    data: agents = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["agents", searchParams],
    queryFn: () => fetchAgents(searchParams!),
    enabled: !!searchParams,
  });

  const handleSearch = async (params: {
    lineaId: string;
    provinciaId: string;
    partidoId: string;
    localidadId: string;
  }) => {
    setSearchParams(params);
    await refetch();
  };

  if (error) {
    toast.error("Error al buscar agentes. Intente nuevamente.");
  }

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Buscar agentes autorizados
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete los campos para encontrar los agentes de servicio técnico
            en su zona
          </p>
        </div>
        <AgentSearchForm
          agrupaciones={agrupaciones}
          paises={paises}
          onSearch={handleSearch}
        />
      </div>
      {searchParams && <AgentResults agents={agents} isLoading={isLoading} />}
    </div>
  );
}
