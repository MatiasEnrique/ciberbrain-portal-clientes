"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

const recoverPasswordSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
});

type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>;

// API function for recover password mutation
const recoverPassword = async (data: { email: string }) => {
  const response = await fetch("/api/auth/recover-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Ha ocurrido un error");
  }

  return result;
};

export function RecoverPasswordForm() {
  const [responseMessage, setResponseMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: (data) => {
      setResponseMessage({
        type: "success",
        message: data.message,
      });
    },
    onError: (error: Error) => {
      setResponseMessage({
        type: "error",
        message:
          error.message ||
          "Error de comunicación. Por favor, intente nuevamente.",
      });
    },
  });

  const onSubmit = (data: RecoverPasswordFormData) => {
    setResponseMessage(null);
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-4 pb-6">
        <CardTitle className="text-2xl text-center">
          Recuperar Contraseña
        </CardTitle>
        <CardDescription className="text-center">
          Ingrese su correo electrónico y le enviaremos instrucciones para
          recuperar su contraseña
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pb-6">
            {responseMessage && (
              <Alert
                variant={
                  responseMessage.type === "success" ? "default" : "destructive"
                }
              >
                <Mail className="h-4 w-4" />
                <AlertDescription>{responseMessage.message}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="mimail@ejemplo.com"
                      disabled={mutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={
                mutation.isPending || responseMessage?.type === "success"
              }
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Instrucciones"
              )}
            </Button>
            <div className="text-sm text-muted-foreground text-center space-y-3">
              <div>
                Ya tienes una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  Iniciar sesión
                </Link>
              </div>
              <div>
                Aún no tienes cuenta?{" "}
                <Link
                  href="/auth/registrarse"
                  className="text-primary hover:underline"
                >
                  Crear una
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
