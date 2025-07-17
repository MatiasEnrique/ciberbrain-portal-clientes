"use client";

import { Mail, Phone, MapPin, Clock, Building } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

interface AgentResultsProps {
  agents: Agent[];
  isLoading: boolean;
}

export function AgentResults({ agents, isLoading }: AgentResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Buscando agentes...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No se encontraron agentes</CardTitle>
          <CardDescription>
            No hay agentes en esa región, busque en zonas cercanas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building className="mx-auto h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Intente expandir su búsqueda a partidos o provincias cercanas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agentes encontrados</CardTitle>
        <CardDescription>
          {agents.length} {agents.length === 1 ? "agente" : "agentes"} en la
          zona seleccionada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          {agents.map((agent, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{agent.Cliente}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">Dirección</p>
                        <p className="text-muted-foreground">
                          {agent.Domicilio}
                          {agent.Otros && ` ${agent.Otros}`}
                        </p>
                        <p className="text-muted-foreground">
                          {agent.Localidad}, {agent.Provincia}
                        </p>
                      </div>
                    </div>

                    {agent.Telefonos && (
                      <div className="flex items-start gap-3">
                        <Phone className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">Teléfono</p>
                          <p className="text-muted-foreground">
                            {agent.Telefonos}
                          </p>
                        </div>
                      </div>
                    )}

                    {agent.Email && (
                      <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">Email</p>
                          <a
                            href={`mailto:${agent.Email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {agent.Email}
                          </a>
                        </div>
                      </div>
                    )}

                    {agent.HorarioComercial && (
                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">Horario comercial</p>
                          <p className="text-muted-foreground">
                            {agent.HorarioComercial}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
