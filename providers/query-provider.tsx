"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "sonner";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && error.message.includes('4')) {
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: false,
        onError: (error) => {
          // Global error handling for mutations
          console.error('Mutation error:', error);
          
          // Check if error is a network error
          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
              toast.error('Error de conexión. Verifica tu conexión a internet.');
            } else if (error.message.includes('401')) {
              toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            } else if (error.message.includes('403')) {
              toast.error('No tienes permisos para realizar esta acción.');
            } else if (error.message.includes('500')) {
              toast.error('Error interno del servidor. Intenta nuevamente más tarde.');
            } else {
              toast.error('Ha ocurrido un error inesperado. Intenta nuevamente.');
            }
          }
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
