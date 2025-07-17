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
import { Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// API function for reset password mutation
const resetPassword = async (data: { token: string; password: string }) => {
  const response = await fetch("/api/auth/reset-password", {
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

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [responseMessage, setResponseMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordFormData) =>
      resetPassword({ token, password: data.password }),
    onSuccess: (data) => {
      setResponseMessage({
        type: "success",
        message: data.message,
      });

      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
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

  useEffect(() => {
    if (!token) {
      setResponseMessage({
        type: "error",
        message: "Token inválido o faltante",
      });
    }
  }, [token]);

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;
    setResponseMessage(null);
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Restablecer Contraseña
        </CardTitle>
        <CardDescription className="text-center">
          Ingrese su nueva contraseña
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            {responseMessage && (
              <Alert
                variant={
                  responseMessage.type === "success" ? "default" : "destructive"
                }
              >
                {responseMessage.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : null}
                <AlertDescription>{responseMessage.message}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={mutation.isPending || !token}
                      {...field}
                    />
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
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={mutation.isPending || !token}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={
                mutation.isPending ||
                responseMessage?.type === "success" ||
                !token
              }
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Contraseña"
              )}
            </Button>

            <div className="flex space-x-2 text-center text-sm">
              <p>Recordaste tu contraseña?</p>
              <Link
                href="/auth/login"
                className="text-primary hover:underline transition-colors"
              >
                Ir al login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
