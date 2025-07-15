import { toast } from 'sonner';

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 10000,
    retries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Don't retry on 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry on 5xx errors or network errors
      if (response.ok || attempt === retries) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on AbortError (timeout)
      if (lastError.name === 'AbortError') {
        lastError = new Error('Request timeout');
        break;
      }

      // Don't retry on other non-network errors
      if (
        !lastError.message.includes('fetch') &&
        !lastError.message.includes('network') &&
        !lastError.message.includes('Failed to fetch')
      ) {
        break;
      }

      // Wait before retry (except on last attempt)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export async function fetchWithErrorHandling<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const response = await fetchWithRetry(url, options);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse error response, use the HTTP status
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        toast.error('La solicitud ha tardado demasiado. Intenta nuevamente.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        toast.error('Error de conexión. Verifica tu conexión a internet.');
      } else if (error.message.includes('401')) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else if (error.message.includes('403')) {
        toast.error('No tienes permisos para realizar esta acción.');
      } else if (error.message.includes('404')) {
        toast.error('El recurso solicitado no fue encontrado.');
      } else if (error.message.includes('500')) {
        toast.error('Error interno del servidor. Intenta nuevamente más tarde.');
      }
    }
    
    throw error;
  }
}

// Utility for form submissions with proper error handling
export async function submitForm<T>(
  url: string,
  data: FormData | Record<string, unknown>,
  options: FetchOptions = {}
): Promise<T> {
  const fetchOptions: FetchOptions = {
    method: 'POST',
    ...options,
  };

  if (data instanceof FormData) {
    fetchOptions.body = data;
  } else {
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };
    fetchOptions.body = JSON.stringify(data);
  }

  return fetchWithErrorHandling<T>(url, fetchOptions);
}

// Utility for API calls with automatic authentication
export async function apiCall<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const fetchOptions: FetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetchWithErrorHandling<T>(url, fetchOptions);
}