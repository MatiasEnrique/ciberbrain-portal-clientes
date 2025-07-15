'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Protected route error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl">Error en la aplicación</CardTitle>
          <CardDescription>
            Ha ocurrido un error en el área protegida. Intenta nuevamente o inicia sesión nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="text-left">
              <p className="text-sm text-muted-foreground mb-2">Error details:</p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={reset}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar nuevamente
            </Button>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}