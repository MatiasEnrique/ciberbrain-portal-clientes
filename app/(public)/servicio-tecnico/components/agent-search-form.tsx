"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  LocalidadSchemaType,
  PaisSchemaType,
  PartidoSchemaType,
  ProvinciaSchemaType,
} from "@/lib/schemas";

type Agrupacion = { ID: number; Agrupacion: string };

interface AgentSearchFormProps {
  agrupaciones: Agrupacion[];
  paises: PaisSchemaType[];
  onSearch: (params: {
    lineaId: string;
    provinciaId: string;
    partidoId: string;
    localidadId: string;
  }) => void;
}

const fetchProvincias = async (
  paisId: string
): Promise<ProvinciaSchemaType[]> => {
  const response = await fetch(`/api/provincias?paisId=${paisId}`);
  if (!response.ok) throw new Error("Failed to fetch provincias");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const fetchPartidos = async (
  provinciaId: string
): Promise<PartidoSchemaType[]> => {
  const response = await fetch(`/api/partidos?provinciaId=${provinciaId}`);
  if (!response.ok) throw new Error("Failed to fetch partidos");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const fetchLocalidades = async (
  partidoId: string
): Promise<LocalidadSchemaType[]> => {
  const response = await fetch(`/api/localidades?partidoId=${partidoId}`);
  if (!response.ok) throw new Error("Failed to fetch localidades");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export function AgentSearchForm({
  agrupaciones,
  paises,
  onSearch,
}: AgentSearchFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lineaId, setLineaId] = useState("0");
  const [paisId, setPaisId] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [partidoId, setPartidoId] = useState("");
  const [localidadId, setLocalidadId] = useState("");

  const { data: provincias = [], isLoading: loadingProvincias } = useQuery({
    queryKey: ["provincias", paisId],
    queryFn: () => fetchProvincias(paisId),
    enabled: !!paisId,
  });

  const { data: partidos = [], isLoading: loadingPartidos } = useQuery({
    queryKey: ["partidos", provinciaId],
    queryFn: () => fetchPartidos(provinciaId),
    enabled: !!provinciaId,
  });

  const { data: localidades = [], isLoading: loadingLocalidades } = useQuery({
    queryKey: ["localidades", partidoId],
    queryFn: () => fetchLocalidades(partidoId),
    enabled: !!partidoId,
  });

  const handlePaisChange = (newPaisId: string) => {
    setPaisId(newPaisId);
    setProvinciaId("");
    setPartidoId("");
    setLocalidadId("");
  };

  const handleProvinciaChange = (newProvinciaId: string) => {
    setProvinciaId(newProvinciaId);
    setPartidoId("");
    setLocalidadId("");
  };

  const handlePartidoChange = (newPartidoId: string) => {
    setPartidoId(newPartidoId);
    setLocalidadId("");
  };

  const handleSearch = () => {
    if (provinciaId && partidoId && localidadId) {
      setIsLoading(true);
      onSearch({
        lineaId,
        provinciaId,
        partidoId,
        localidadId,
      });
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const isFormValid = provinciaId && partidoId && localidadId;

  return (
    <div className="space-y-6">
      {agrupaciones.length > 0 && (
        <div>
          <Label htmlFor="linea">Línea de productos</Label>
          <Select value={lineaId} onValueChange={setLineaId}>
            <SelectTrigger id="linea">
              <SelectValue placeholder="Seleccione línea de productos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todas las líneas</SelectItem>
              {agrupaciones.map((agr) => (
                <SelectItem key={agr.ID} value={agr.ID.toString()}>
                  {agr.Agrupacion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="pais">País</Label>
          <Select value={paisId} onValueChange={handlePaisChange}>
            <SelectTrigger id="pais">
              <SelectValue placeholder="Seleccione país" />
            </SelectTrigger>
            <SelectContent>
              {paises.map((pais) => (
                <SelectItem key={pais.ID} value={pais.ID.toString()}>
                  {pais.Pais}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="provincia">Provincia</Label>
          <Select
            value={provinciaId}
            onValueChange={handleProvinciaChange}
            disabled={!paisId || loadingProvincias}
          >
            <SelectTrigger id="provincia">
              {loadingProvincias ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </div>
              ) : (
                <SelectValue placeholder="Seleccione provincia" />
              )}
            </SelectTrigger>
            <SelectContent>
              {provincias.map((prov) => (
                <SelectItem key={prov.ID} value={prov.ID.toString()}>
                  {prov.Provincia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="partido">Partido</Label>
          <Select
            value={partidoId}
            onValueChange={handlePartidoChange}
            disabled={!provinciaId || loadingPartidos}
          >
            <SelectTrigger id="partido">
              {loadingPartidos ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </div>
              ) : (
                <SelectValue placeholder="Seleccione partido" />
              )}
            </SelectTrigger>
            <SelectContent>
              {partidos.map((part) => (
                <SelectItem key={part.ID} value={part.ID.toString()}>
                  {part.Partido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="localidad">Localidad</Label>
          <Select
            value={localidadId}
            onValueChange={setLocalidadId}
            disabled={!partidoId || loadingLocalidades}
          >
            <SelectTrigger id="localidad">
              {loadingLocalidades ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </div>
              ) : (
                <SelectValue placeholder="Seleccione localidad" />
              )}
            </SelectTrigger>
            <SelectContent>
              {localidades.map((loc) => (
                <SelectItem key={loc.ID} value={loc.ID.toString()}>
                  {loc.Localidad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={handleSearch}
          disabled={!isFormValid || isLoading}
          className="w-full max-w-md"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando agentes...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar agentes autorizados
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Seleccione la ubicación para encontrar los agentes autorizados más
        cercanos
      </p>
    </div>
  );
}
