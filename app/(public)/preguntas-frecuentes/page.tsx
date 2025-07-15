import { EditableText } from "@/components/editable-text";
import { FAQClient } from "@/app/(public)/preguntas-frecuentes/components/faq-client";
import { getEditableTexts, defaultTexts } from "@/lib/editable-text";

export default async function PreguntasFrecuentesPage() {
  const editableTexts = await getEditableTexts("PreguntasFrecuentes");

  const texts = {
    ...defaultTexts.PreguntasFrecuentes,
    ...editableTexts,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <EditableText
            elementId="lbl_titulo_preguntas"
            pageName="PreguntasFrecuentes"
            className="text-4xl font-bold text-gray-900 mb-4"
            defaultContent={texts.lbl_titulo_preguntas}
          />
          <EditableText
            elementId="lbl_subtitulo_preguntas"
            pageName="PreguntasFrecuentes"
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            defaultContent={texts.lbl_subtitulo_preguntas}
          />
        </div>

        <FAQClient />
      </div>
    </div>
  );
}
