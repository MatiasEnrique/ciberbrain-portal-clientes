import { GalleryVerticalEnd, Mail, Phone, MapPin } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ContactForm } from "./components/contact-form";
import { getEditableTexts, defaultTexts } from "@/lib/editable-text";
import { EditableText } from "@/components/editable-text";

export default async function ContactoPage() {
  const editableTexts = await getEditableTexts("Contacto");
  return (
    <div className="flex flex-col items-center justify-center gap-6  p-6 md:p-10">
      <div className="flex w-full max-w-6xl flex-col gap-6">
        <div className="text-center">
          <EditableText
            elementId="Titulo_Contacto"
            pageName="Contacto"
            defaultContent={
              editableTexts.Titulo_Contacto ||
              defaultTexts.Contacto.Titulo_Contacto
            }
            contentType="html"
            className="text-3xl font-bold tracking-tight"
          />
          <EditableText
            elementId="Subtitulo_Contacto"
            pageName="Contacto"
            defaultContent={
              editableTexts.Subtitulo_Contacto ||
              defaultTexts.Contacto.Subtitulo_Contacto
            }
            contentType="markdown"
            className="mt-2 text-muted-foreground"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <EditableText
                elementId="Titulo_Formulario"
                pageName="Contacto"
                defaultContent={
                  editableTexts.Titulo_Formulario ||
                  "Envíanos un mensaje"
                }
                contentType="html"
              />
              <EditableText
                elementId="Descripcion_Formulario"
                pageName="Contacto"
                defaultContent={
                  editableTexts.Descripcion_Formulario ||
                  "Completa el formulario y te responderemos a la brevedad"
                }
                contentType="markdown"
                className="text-sm text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <EditableText
                  elementId="Titulo_Info_Contacto"
                  pageName="Contacto"
                  defaultContent={
                    editableTexts.Titulo_Info_Contacto ||
                    "Información de contacto"
                  }
                  contentType="html"
                  className="text-lg font-semibold"
                />
                <EditableText
                  elementId="Descripcion_Info_Contacto"
                  pageName="Contacto"
                  defaultContent={
                    editableTexts.Descripcion_Info_Contacto ||
                    "También puedes comunicarte con nosotros por estos medios"
                  }
                  contentType="markdown"
                  className="text-sm text-muted-foreground"
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <EditableText
                      elementId="Telefono_Contacto"
                      pageName="Contacto"
                      defaultContent={
                        editableTexts.Telefono_Contacto ||
                        "+54 11 1234-5678"
                      }
                      contentType="html"
                      className="text-sm text-muted-foreground"
                    />
                    <EditableText
                      elementId="Horario_Contacto"
                      pageName="Contacto"
                      defaultContent={
                        editableTexts.Horario_Contacto ||
                        "Lunes a Viernes de 9:00 a 18:00 hs"
                      }
                      contentType="html"
                      className="text-sm text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <EditableText
                      elementId="Email_Contacto"
                      pageName="Contacto"
                      defaultContent={
                        editableTexts.Email_Contacto ||
                        "contacto@ciberbrain.com"
                      }
                      contentType="html"
                      className="text-sm text-muted-foreground"
                    />
                    <EditableText
                      elementId="Email_Soporte"
                      pageName="Contacto"
                      defaultContent={
                        editableTexts.Email_Soporte ||
                        "soporte@ciberbrain.com"
                      }
                      contentType="html"
                      className="text-sm text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Dirección</p>
                    <EditableText
                      elementId="Direccion_Contacto"
                      pageName="Contacto"
                      defaultContent={
                        editableTexts.Direccion_Contacto ||
                        "Av. Ejemplo 1234, Piso 5"
                      }
                      contentType="html"
                      className="text-sm text-muted-foreground"
                    />
                    <EditableText
                      elementId="Ciudad_Contacto"
                      pageName="Contacto"
                      defaultContent={
                        editableTexts.Ciudad_Contacto ||
                        "Buenos Aires, Argentina"
                      }
                      contentType="html"
                      className="text-sm text-muted-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <EditableText
                  elementId="Titulo_Redes"
                  pageName="Contacto"
                  defaultContent={
                    editableTexts.Titulo_Redes ||
                    "Redes sociales"
                  }
                  contentType="html"
                  className="text-lg font-semibold"
                />
                <EditableText
                  elementId="Descripcion_Redes"
                  pageName="Contacto"
                  defaultContent={
                    editableTexts.Descripcion_Redes ||
                    "Síguenos en nuestras redes para estar al día"
                  }
                  contentType="markdown"
                  className="text-sm text-muted-foreground"
                />
              </CardHeader>
              <CardContent>
                <EditableText
                  elementId="Texto_Contacto"
                  pageName="Contacto"
                  defaultContent={
                    editableTexts.Texto_Contacto ||
                    defaultTexts.Contacto.Texto_Contacto
                  }
                  contentType="markdown"
                  className="flex flex-col gap-2 text-sm"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
