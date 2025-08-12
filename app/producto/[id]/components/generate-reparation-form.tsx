"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import * as React from "react";
import {
  opcionesAsistenciaSchema,
  politicaSchema,
} from "@/lib/schemas";
import { generateReparationSchema } from "../schemas";
import z from "zod";
import { productSchema } from "@/lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateReparation } from "../actions";

export default function GenerateReparationForm({
  opcionesAsistencia,
  politicas,
  producto,
}: {
  opcionesAsistencia: z.infer<typeof opcionesAsistenciaSchema>[];
  politicas: z.infer<typeof politicaSchema>[];
  producto: z.infer<typeof productSchema>;
}) {
  const onlyOne = politicas.length === 1;
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<z.infer<typeof generateReparationSchema>>({
    resolver: zodResolver(generateReparationSchema),
    defaultValues: {
      ID: producto.ID,
      fecha: undefined,
      politica: onlyOne ? politicas[0].IDPolitica : undefined,
      descripcion: "",
      opcion_asistencia: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: generateReparation,
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success("Solicitud generada con éxito");
      form.reset();
    },
    onError: () => {
      toast.error("Ha ocurrido un error al generar la solicitud.");
    },
  });

  const [fecha, setFecha] = React.useState<boolean>(false);

  const [open, setOpen] = React.useState(false);

  function onSubmit(values: z.infer<typeof generateReparationSchema>) {
    startTransition(() => {
      mutation.mutate(values);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="politica"
          render={({ field }) => {
            const selectedValue = onlyOne
              ? String(politicas[0].IDPolitica)
              : field.value
              ? String(field.value)
              : "";
            return (
              <FormItem>
                <FormLabel>Politica de Asistencia</FormLabel>
                <FormControl>
                  <Select
                    value={selectedValue}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={onlyOne}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una política" />
                    </SelectTrigger>
                    <SelectContent>
                      {politicas.map((politica) => (
                        <SelectItem
                          key={politica.IDPolitica}
                          value={String(politica.IDPolitica)}
                        >
                          {politica.Politica}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción de la falla</FormLabel>
              <FormControl>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="opcion_asistencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opción de Asistencia</FormLabel>
              <FormControl>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                    const selected = opcionesAsistencia.find(
                      (opcion) => String(opcion.id) === value
                    );
                    if (selected) {
                      setFecha(selected.Fecha);
                    }
                  }}
                  defaultValue={field.value ? String(field.value) : undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesAsistencia.map((opcion) => (
                      <SelectItem key={opcion.id} value={String(opcion.id)}>
                        {opcion.Opcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {fecha && (
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Servicio</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-fit justify-start text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generando..." : "Generar Solicitud"}
        </Button>
      </form>
    </Form>
  );
}
