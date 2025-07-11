import { CheckCircle2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function VerificationSuccessAlert() {
  return (
    <Alert className="fixed left-1/2 top-5 w-full max-w-sm -translate-x-1/2">
      <CheckCircle2Icon className="h-4 w-4" />
      <AlertTitle>¡Tu cuenta ha sido validada con éxito!</AlertTitle>
      <AlertDescription>
        Ahora puedes ingresar con tus credenciales.
      </AlertDescription>
    </Alert>
  );
}
