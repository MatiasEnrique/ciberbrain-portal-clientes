"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useRef, useTransition } from "react";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { CalendarIcon, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Modelo, modeloSchema, Marca, marcaSchema } from "@/lib/schemas";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import {
  registerProductSchema,
  RegisterProductPayload,
} from "@/app/productos/schemas";

import { registerProduct } from "../actions";

interface ProductFormProps {
  userId: string;
  onFormSubmitSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  userId,
  onFormSubmitSuccess,
  onCancel,
}: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const [selectedFactura, setSelectedFactura] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RegisterProductPayload>({
    resolver: zodResolver(registerProductSchema),
    defaultValues: {
      codigo: "",
      descripcion: "",
      nroSerie: "",
      comercio: "",
      idComercio: 0,
      facturaCompra: "",
      fotoFacturaCompra: null,
      fechaCompra: undefined,
      mesesAdicionales: 0,
      marca: 0,
      ubicacion: null,
    },
  });

  // Controlled input values
  const [modeloInputValue, setModeloInputValue] = useState("");
  const [marcaInputValue, setMarcaInputValue] = useState("");
  const [nroSerieInputValue, setNroSerieInputValue] = useState("");
  const [comercioInputValue, setComercioInputValue] = useState("");

  // Popover open state
  const [isModeloPopoverOpen, setIsModeloPopoverOpen] = useState(false);
  const [isMarcaPopoverOpen, setIsMarcaPopoverOpen] = useState(false);

  // Debounced values for queries only
  const [debouncedModeloInput] = useDebounce(modeloInputValue, 700);
  const [debouncedNroSerieValidationTriggerInput] = useDebounce(
    nroSerieInputValue,
    2000
  );
  const [debouncedComercioValidationTriggerInput] = useDebounce(
    comercioInputValue,
    1500
  );

  // Always derive current values from form state
  const currentModeloValue = form.watch("codigo");
  const currentMarcaValue = form.watch("marca");

  // Query for modelos
  const { data: modelosData, isLoading: isLoadingModelos } = useQuery<
    Modelo[],
    Error,
    Modelo[],
    any[]
  >({
    queryKey: ["modelos", debouncedModeloInput, currentMarcaValue],
    queryFn: async () => {
      if (
        debouncedModeloInput.length === 0 ||
        !currentMarcaValue ||
        currentMarcaValue === 0
      ) {
        return [];
      }
      const response = await fetch(
        `/api/productos/modelos?modelo=${debouncedModeloInput}&marca=${currentMarcaValue}`
      );
      if (!response.ok) {
        toast.error("Error al cargar modelos");
        return [];
      }
      try {
        const data = await response.json();
        return modeloSchema.array().parse(data);
      } catch (e) {
        toast.error("Error al procesar datos de modelos");
        console.error("Modelo parsing error:", e);
        return [];
      }
    },
    enabled:
      debouncedModeloInput.length > 0 &&
      !!currentMarcaValue &&
      currentMarcaValue > 0,
    placeholderData: (previousData) => previousData,
  });

  // Query for marcas
  const { data: marcasData, isLoading: isLoadingMarcas } = useQuery<
    Marca[],
    Error,
    Marca[],
    any[]
  >({
    queryKey: ["marcas"],
    queryFn: async () => {
      const response = await fetch(`/api/productos/marcas`);
      if (!response.ok) {
        toast.error("Error al cargar marcas");
        return [];
      }
      try {
        const data = await response.json();
        return marcaSchema.array().parse(data);
      } catch (e) {
        toast.error("Error al procesar datos de marcas");
        console.error("Marca parsing error:", e);
        return [];
      }
    },
    placeholderData: (previousData) => previousData,
  });

  // Handlers for input changes and selection
  function handleMarcaInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMarcaInputValue(e.target.value);
    form.clearErrors("marca");
    if (e.target.value.length > 0) {
      setIsMarcaPopoverOpen(true);
    } else {
      form.setValue("marca", 0, { shouldValidate: false });
      setIsMarcaPopoverOpen(false);
    }
  }

  function handleMarcaSelect(currentValue: string) {
    const selectedMarca = marcasData?.find((m) => m.Marca === currentValue);
    if (selectedMarca) {
      setMarcaInputValue(selectedMarca.Marca);
      form.setValue("marca", selectedMarca.Codigo, { shouldValidate: true });
      setIsMarcaPopoverOpen(false);
      // Reset modelo input and value when marca changes
      setModeloInputValue("");
      form.setValue("codigo", "", { shouldValidate: false });
      form.clearErrors("codigo");
    }
    form.setFocus("codigo");
  }

  function handleModeloInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setModeloInputValue(e.target.value);
    form.clearErrors("codigo");
    if (e.target.value.length > 0) {
      setIsModeloPopoverOpen(true);
    } else {
      setIsModeloPopoverOpen(false);
    }
  }

  function handleModeloSelect(currentValue: string) {
    const selectedModelo = modelosData?.find((m) => m.Codigo === currentValue);
    setModeloInputValue(currentValue);
    form.setValue("codigo", currentValue, { shouldValidate: true });
    if (selectedModelo) {
      form.setValue("descripcion", selectedModelo.Descripcion, {
        shouldValidate: false,
      });
    }
    setIsModeloPopoverOpen(false);
    form.setFocus("nroSerie");
  }

  function handleNroSerieInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNroSerieInputValue(e.target.value);
    form.setValue("nroSerie", e.target.value, { shouldValidate: true });
    form.clearErrors("nroSerie");
  }

  function handleComercioInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setComercioInputValue(e.target.value);
    form.setValue("comercio", e.target.value, { shouldValidate: true });
    form.clearErrors("comercio");
  }

  function handleSubmit(values: RegisterProductPayload) {
    startTransition(async () => {
      const idUsuario = parseInt(userId);
      if (isNaN(idUsuario)) {
        toast.error("ID de usuario inválido.");
        return;
      }

      try {
        const result = await registerProduct(values);

        if (result.error) {
          toast.error(result.error || "Error al registrar el producto.");
        } else {
          toast.success("Producto registrado correctamente");
          form.reset();
          setModeloInputValue("");
          setNroSerieInputValue("");
          setComercioInputValue("");
          setMarcaInputValue("");
          queryClient.invalidateQueries({ queryKey: ["products"] });
          onFormSubmitSuccess();
        }
      } catch (error: any) {
        const errorMessage =
          error?.message ||
          "Ocurrió un error inesperado al registrar el producto.";
        toast.error(errorMessage);
        console.error("Error en el envío del producto:", error);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {})}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="marca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <Popover
                open={isMarcaPopoverOpen}
                onOpenChange={setIsMarcaPopoverOpen}
                modal={true}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Input
                      placeholder="Escribe para buscar marcas..."
                      value={marcaInputValue}
                      onChange={handleMarcaInputChange}
                      className="text-left"
                      disabled={isPending}
                    />
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-[var(--radix-popper-anchor-width)]"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Buscando..."
                      value={marcaInputValue}
                      onValueChange={setMarcaInputValue}
                    />
                    <CommandList>
                      {isLoadingMarcas && (
                        <CommandItem disabled>Cargando...</CommandItem>
                      )}
                      <CommandEmpty>
                        {!isLoadingMarcas && marcasData && marcasData.length > 0
                          ? "No se encontraron marcas con ese filtro."
                          : isLoadingMarcas
                          ? "Cargando marcas..."
                          : "No hay marcas disponibles."}
                      </CommandEmpty>
                      {marcasData && marcasData.length > 0 && (
                        <CommandGroup>
                          {marcasData.map((marca) => (
                            <CommandItem
                              key={marca.Codigo}
                              value={marca.Marca}
                              onSelect={handleMarcaSelect}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {marca.Marca}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <Popover
                open={isModeloPopoverOpen}
                onOpenChange={setIsModeloPopoverOpen}
                modal={true}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Input
                      placeholder="Escribe para buscar modelos..."
                      value={modeloInputValue}
                      onChange={handleModeloInputChange}
                      className="text-left "
                      disabled={isPending}
                    />
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-[var(--radix-popper-anchor-width)]"
                  align="start"
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscando..."
                      value={modeloInputValue}
                      onValueChange={setModeloInputValue}
                    />
                    <CommandList>
                      {isLoadingModelos && (
                        <CommandItem disabled>Cargando...</CommandItem>
                      )}
                      <CommandEmpty>
                        {debouncedModeloInput.length > 0 && !isLoadingModelos
                          ? "No se encontraron modelos."
                          : "Escribe para buscar."}
                      </CommandEmpty>
                      {modelosData && modelosData.length > 0 && (
                        <CommandGroup>
                          {modelosData.map((modelo) => (
                            <CommandItem
                              key={modelo.Codigo}
                              value={modelo.Codigo}
                              onSelect={handleModeloSelect}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {modelo.Codigo}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {modelo.Descripcion}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nroSerie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Serie</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: ABC123XYZ789"
                  value={nroSerieInputValue}
                  onChange={handleNroSerieInputChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comercio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comercio</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre del Comercio"
                  value={comercioInputValue}
                  onChange={handleComercioInputChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fechaCompra"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Compra</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !field.value && "text-muted-foreground"
                      }`}
                      disabled={isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="facturaCompra"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Factura de Compra</FormLabel>
              <FormControl>
                <Input placeholder="Número de Factura" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fotoFacturaCompra"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Factura de Compra</FormLabel>
              <FormControl>
                <div>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFactura(file);
                      field.onChange(file);
                      if (file) {
                        toast.info(`Archivo seleccionado: ${file.name}`);
                      }
                    }}
                    className="hidden"
                    disabled={isPending}
                  />
                  {!selectedFactura ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full justify-start text-left font-normal"
                      disabled={isPending}
                    >
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Seleccionar archivo
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <span className="truncate_ max-w-[calc(100%-3rem)]">
                        {selectedFactura.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedFactura(null);
                          field.onChange(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                          toast.info("Archivo eliminado.");
                        }}
                        disabled={isPending}
                        className="h-6 w-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? "Procesando..." : "Agregar Producto"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
