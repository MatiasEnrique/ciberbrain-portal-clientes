"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { register } from "../actions";
import {
  PaisSchemaType,
  PartidoSchemaType,
  ProvinciaSchemaType,
  registerSchema,
} from "../schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import z from "zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function RegisterForm({ paises }: { paises: PaisSchemaType[] }) {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      profile: "Consumidor",
      dni: "",
      lastName: "",
      firstName: "",
      country: 1,
      province: 0,
      partido: 0,
      city: "",
      postalCode: "",
      street: "",
      streetNumber: "",
      otherAddressDetails: "",
      crossStreet1: "",
      crossStreet2: "",
      preferredTime: "",
      birthDate: "",
      phone: "",
      mobilePhone: "",
      session: crypto.randomUUID(),
    },
  });

  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const { data: provincias, isLoading } = useQuery<
    ProvinciaSchemaType[],
    Error,
    ProvinciaSchemaType[],
    any[]
  >({
    queryKey: ["provincias", form.watch("country")],
    queryFn: async () => {
      const request = await fetch(
        `/auth/registrarse/api/provincias?pais=${form.getValues("country")}`
      );
      return await request.json();
    },
  });

  const { data: partidos, isLoading: isLoadingPartidos } = useQuery<
    PartidoSchemaType[],
    Error,
    PartidoSchemaType[],
    any[]
  >({
    queryKey: ["partidos", form.watch("province")],
    queryFn: async () => {
      const request = await fetch(
        `/auth/registrarse/api/partidos?provincia=${form.getValues("province")}`
      );
      return await request.json();
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    startTransition(async () => {
      try {
        const { success, message } = await register(values);
        if (success) {
          toast.success(message);
        } else {
          if (!success) {
            toast.error(message);
          } else {
            toast.error("Ocurrió un error.");
          }
        }
      } catch (error) {
        toast.error("Error al contactar el servidor.");
        console.error("Error calling server action:", error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Completa los campos para registrarte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clave</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar clave</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Dni</FormLabel>
                    <FormControl>
                      <Input placeholder="00000001" {...field} />
                    </FormControl>
                    <FormDescription>Sin puntos ni guiones</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 w-full">
                    <FormLabel>Pais</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value, 10));
                        form.setValue("province", 0);
                        form.setValue("partido", 0);
                      }}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccioná un país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paises.map((pais) => (
                          <SelectItem
                            key={pais.pais}
                            value={pais.id.toString()}
                          >
                            {pais.pais}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Provincia</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value, 10));
                        form.setValue("partido", 0);
                      }}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccioná una provincia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provincias?.map((provincia: ProvinciaSchemaType) => (
                          <SelectItem
                            key={provincia.id}
                            value={provincia.id.toString()}
                          >
                            {provincia.provincia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partido"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Partido</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value, 10))
                      }
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccioná un partido" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partidos?.map((partido: PartidoSchemaType) => (
                          <SelectItem
                            key={partido.id}
                            value={partido.id.toString()}
                          >
                            {partido.partido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localidad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>C.Postal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Calle</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="streetNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>&nbsp;</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherAddressDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Otros</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Piso, Depto, etc."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>(opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crossStreet1"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Entre</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>(opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crossStreet2"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>y Entre</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>(opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 9-18hs"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>(opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacimiento</FormLabel>
                    <FormControl>
                      <Input placeholder="dd/mm/aaaa" {...field} />
                    </FormControl>
                    <FormDescription>(opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormDescription>(opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobilePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormDescription>&nbsp;</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <Button type="submit" className="w-auto" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-auto"
                  onClick={() => form.reset()}
                  disabled={isPending}
                >
                  Abandonar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
