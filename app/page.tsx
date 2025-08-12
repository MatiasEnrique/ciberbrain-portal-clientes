import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditableText } from "@/components/editable-text";
import { getEditableTexts } from "@/lib/editable-text";
import {
  UserPlus,
  Package,
  Wrench,
  HelpCircle,
  Lightbulb,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const editableTexts = await getEditableTexts("UsuarioDefault");

  const quickAccessItems = [
    {
      id: "Panel1",
      icon: UserPlus,
      titleId: "Registrese_title",
      title: "Crear una cuenta",
      descriptionId: "DescripcionRegistracion",
      description:
        "Registro sus datos con nosotros y podremos ofrecerle mejor servicio",
      href: "/auth/registrarse",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    },
    {
      id: "Panel4",
      icon: Package,
      titleId: "MisProductos_Title",
      title: "Mis productos",
      descriptionId: "DescripcionRegistracionProductos",
      description: "Registro sus productos y sume beneficios",
      href: "/productos",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
    },
    {
      id: "Panel2",
      icon: Wrench,
      titleId: "ServicioTecnico_title",
      title: "Servicio técnico",
      descriptionId: "DescripcionServicioTecnico",
      description:
        "Encuentre el agente de servicios mas cercano a su domicilio",
      href: "/servicio-tecnico",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    },
    {
      id: "Panel3",
      icon: HelpCircle,
      titleId: "PreguntasFrecuentes_title",
      title: "Preguntas Frecuentes",
      descriptionId: "DescripcionFaq",
      description: "Encuentre respuestas para las preguntas mas frecuentes",
      href: "/preguntas-frecuentes",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    },
    {
      id: "Panel5",
      icon: Lightbulb,
      titleId: "ConsejosUtiles_title",
      title: "Consejos Útiles",
      descriptionId: "DescripcionConsejosUtiles",
      description: "Consejos para extender la vida de su producto",
      href: "/consejos-utiles",
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
    },
    {
      id: "PanelConsulta",
      icon: Eye,
      titleId: "Consultas_title",
      title: "Seguimiento de tu caso",
      descriptionId: "DescripcionConsultas",
      description: "Ver información del estado de tu caso",
      href: "/consultas",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <EditableText
              elementId="Titulo"
              pageName="UsuarioDefault"
              defaultContent={editableTexts.Titulo || "Servicios al Cliente"}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            />
            <EditableText
              elementId="Titulo_Secundario"
              pageName="UsuarioDefault"
              defaultContent={
                editableTexts.Titulo_Secundario ||
                "Bienvenido a nuestro portal de servicios al cliente.- Aquí encontrarás herramientas para lograr rápida atención y sumar beneficios"
              }
              className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto"
            />
          </div>

          <div className="mb-8">
            <EditableText
              elementId="AccesoRapido"
              pageName="UsuarioDefault"
              defaultContent={editableTexts.AccesoRapido || "Accesos rápidos:"}
              className="text-2xl font-semibold text-gray-800 mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.id}
                    className={`transition-all duration-300 hover:shadow-lg ${item.color}`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                          <Icon className="w-8 h-8 text-gray-700" />
                        </div>
                      </div>

                      <EditableText
                        elementId={item.titleId}
                        pageName="UsuarioDefault"
                        defaultContent={
                          editableTexts[item.titleId] || item.title
                        }
                        className="text-lg font-semibold text-gray-900 mb-3"
                      />

                      <EditableText
                        elementId={item.descriptionId}
                        pageName="UsuarioDefault"
                        defaultContent={
                          editableTexts[item.descriptionId] || item.description
                        }
                        className="text-gray-600 text-sm mb-4 leading-relaxed"
                      />

                      <Button
                        asChild
                        className="w-full rounded-full bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
                      >
                        <Link href={item.href}>Acceder</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              Portal de Servicios al Cliente
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
