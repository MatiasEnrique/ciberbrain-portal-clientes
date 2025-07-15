import { MapPin, Phone, Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getAgrupaciones, getPaises } from "./data";
import { ServicioTecnicoClient } from "./components/servicio-tecnico-client";
import { hasPermission } from "@/lib/permissions";
import { getEditableTexts, defaultTexts } from "@/lib/editable-text";
import { EditableText } from "@/components/editable-text";
import { redirect } from "next/navigation";

export default async function ServicioTecnicoPage() {
  const hasRedAgentesPermission = await hasPermission("RED_AGENTES");

  if (!hasRedAgentesPermission) {
    redirect("/");
  }

  const [agrupaciones, paises, editableTexts] = await Promise.all([
    hasRedAgentesPermission ? getAgrupaciones() : Promise.resolve([]),
    hasRedAgentesPermission ? getPaises() : Promise.resolve([]),
    getEditableTexts("RedAgentes"),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <EditableText
            elementId="lbl_titulo_agentes"
            pageName="RedAgentes"
            defaultContent={
              editableTexts.lbl_titulo_agentes ||
              defaultTexts["RedAgentes"].lbl_titulo_agentes
            }
            className="text-4xl font-bold tracking-tight"
          />
          <EditableText
            elementId="lbl_subtitulo_agentes"
            pageName="RedAgentes"
            defaultContent={
              editableTexts.lbl_subtitulo_agentes ||
              defaultTexts["RedAgentes"].lbl_subtitulo_agentes
            }
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
          />
        </div>

        <>
          <ServicioTecnicoClient agrupaciones={agrupaciones} paises={paises} />

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  Cobertura nacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  Contamos con agentes autorizados en todo el país para
                  brindarle el mejor servicio técnico especializado
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  Atención personalizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  Nuestros técnicos especializados están capacitados para
                  resolver cualquier inconveniente con sus productos
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  Garantía oficial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  Todos nuestros agentes están autorizados para realizar
                  reparaciones con garantía oficial del fabricante
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </>
      </div>
    </div>
  );
}
