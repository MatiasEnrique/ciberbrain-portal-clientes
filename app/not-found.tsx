import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Página no encontrada</CardTitle>
          <CardDescription>
            La página que estás buscando no existe o ha sido movida.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex gap-2 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contacto">
                Contactar soporte
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}