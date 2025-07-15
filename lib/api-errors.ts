import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  success: false;
  code?: string;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  data: T;
  success: true;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      success: false,
      code,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    },
    { status: statusCode }
  );
}

export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      data,
      success: true,
    },
    { status: statusCode }
  );
}

// Common error responses
export const ErrorResponses = {
  UNAUTHORIZED: (message = 'No autorizado') => 
    createErrorResponse(message, 401, 'UNAUTHORIZED'),
  
  FORBIDDEN: (message = 'Acceso prohibido') => 
    createErrorResponse(message, 403, 'FORBIDDEN'),
  
  NOT_FOUND: (message = 'Recurso no encontrado') => 
    createErrorResponse(message, 404, 'NOT_FOUND'),
  
  BAD_REQUEST: (message = 'Solicitud inválida') => 
    createErrorResponse(message, 400, 'BAD_REQUEST'),
  
  INTERNAL_SERVER_ERROR: (message = 'Error interno del servidor') => 
    createErrorResponse(message, 500, 'INTERNAL_SERVER_ERROR'),
  
  VALIDATION_ERROR: (message = 'Error de validación', details?: unknown) => 
    createErrorResponse(message, 400, 'VALIDATION_ERROR', details),
  
  DATABASE_ERROR: (message = 'Error de base de datos') => 
    createErrorResponse(message, 500, 'DATABASE_ERROR'),
  
  NETWORK_ERROR: (message = 'Error de red') => 
    createErrorResponse(message, 500, 'NETWORK_ERROR'),
};

// Utility to handle API errors with proper logging
export function handleApiError(error: unknown, context?: string): NextResponse<ApiError> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  console.error(`API Error${context ? ` in ${context}` : ''}:`, {
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Check for specific error types
  if (error instanceof Error) {
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      return ErrorResponses.UNAUTHORIZED();
    }
    
    if (error.message.includes('Forbidden') || error.message.includes('403')) {
      return ErrorResponses.FORBIDDEN();
    }
    
    if (error.message.includes('Not found') || error.message.includes('404')) {
      return ErrorResponses.NOT_FOUND();
    }
    
    if (error.message.includes('P2010') || error.message.includes('database')) {
      return ErrorResponses.DATABASE_ERROR(errorMessage);
    }
    
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return ErrorResponses.VALIDATION_ERROR(errorMessage);
    }
  }
  
  // Default to internal server error
  return ErrorResponses.INTERNAL_SERVER_ERROR();
}

// Utility to create consistent fetch error handling
export function createFetchError(response: Response): Error {
  const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
  error.name = 'FetchError';
  return error;
}

// Utility for handling fetch responses with proper error handling
export async function handleFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`
    );
    error.name = 'ApiError';
    throw error;
  }
  
  return response.json();
}