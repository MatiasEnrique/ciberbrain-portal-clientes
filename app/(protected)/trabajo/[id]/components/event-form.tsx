"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateEvent } from "@/hooks/use-trabajo";
import { toast } from "sonner";

interface EventType {
  ID: number;
  Suceso: string;
  Descripcion: string | null;
}

interface EventFormProps {
  workOrderId: number;
  tiposSucesos: EventType[];
  onEventCreated: () => void;
}

export function EventForm({
  workOrderId,
  tiposSucesos,
  onEventCreated,
}: EventFormProps) {
  const createEvent = useCreateEvent();
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventType || !description.trim()) {
      toast.error(
        "Por favor selecciona un tipo de suceso y proporciona una descripción."
      );
      return;
    }

    try {
      await createEvent.mutateAsync({
        workOrderId,
        eventData: {
          tipoSuceso: parseInt(selectedEventType),
          comentarios: description.trim(),
        },
      });
      setSelectedEventType("");
      setDescription("");
      onEventCreated();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Nuevo Suceso</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="suceso">Suceso:</Label>
            <Select
              value={selectedEventType}
              onValueChange={setSelectedEventType}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecciona un tipo de suceso" />
              </SelectTrigger>
              <SelectContent>
                {tiposSucesos.map((tipo) => (
                  <SelectItem key={tipo.ID} value={tipo.ID.toString()}>
                    {tipo.Suceso}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="descripcion">
              Descripción: <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción del acontecimiento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={6000}
              rows={4}
              className="mt-2"
              required
            />
            <div className="text-sm text-muted-foreground mt-1">
              {description.length}/6000 caracteres
            </div>
          </div>

          <div className="text-center">
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? "Enviando..." : "Enviar Suceso"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
