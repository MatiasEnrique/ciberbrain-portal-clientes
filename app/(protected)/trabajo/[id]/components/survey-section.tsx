"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./star-rating";
import { useSubmitSurvey } from "@/hooks/use-trabajo";
import { toast } from "sonner";

interface SurveyQuestion {
  ID: number;
  Pregunta: string;
  Respuesta: boolean;
  Orden: number | null;
}

interface SurveyConcept {
  ID: number;
  Concepto: string;
  Conformidad: number | null;
  Orden: number | null;
}

interface SurveySectionProps {
  workOrderId: number;
  preguntas: SurveyQuestion[];
  conceptos: SurveyConcept[];
  onSubmitted: () => void;
}

export function SurveySection({
  workOrderId,
  preguntas,
  conceptos,
  onSubmitted,
}: SurveySectionProps) {
  const submitSurvey = useSubmitSurvey();

  const [respuestas, setRespuestas] = useState<Record<number, boolean>>(
    preguntas.reduce((acc, pregunta) => {
      acc[pregunta.ID] = pregunta.Respuesta;
      return acc;
    }, {} as Record<number, boolean>)
  );

  const [conformidad, setConformidad] = useState<Record<number, number>>(
    conceptos.reduce((acc, concepto) => {
      if (concepto.Conformidad) {
        acc[concepto.ID] = concepto.Conformidad;
      }
      return acc;
    }, {} as Record<number, number>)
  );

  const [comentarios, setComentarios] = useState("");

  const handleQuestionChange = (questionId: number, checked: boolean) => {
    setRespuestas((prev) => ({ ...prev, [questionId]: checked }));
  };

  const handleRatingChange = (conceptId: number, rating: number) => {
    setConformidad((prev) => ({ ...prev, [conceptId]: rating }));
  };

  const validateSurvey = () => {
    // Check if all concepts have ratings
    for (const concepto of conceptos) {
      if (!conformidad[concepto.ID]) {
        return concepto.Concepto;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const missingConcept = validateSurvey();
    if (missingConcept) {
      toast.error(`${missingConcept} por favor!`);
      return;
    }

    const answers: Record<string, boolean | number> = {};
    preguntas.forEach((pregunta) => {
      answers[`pregunta_${pregunta.ID}`] = respuestas[pregunta.ID] || false;
    });
    conceptos.forEach((concepto) => {
      answers[`concepto_${concepto.ID}`] = conformidad[concepto.ID] || 0;
    });

    try {
      await submitSurvey.mutateAsync({
        workOrderId,
        answers,
      });
      onSubmitted();
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("Error al enviar la encuesta. Intenta nuevamente.");
    }
  };

  return (
    <Card id="MarcaEncuesta">
      <CardHeader>
        <CardTitle>Encuesta de Satisfacción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confirmation Questions */}
        {preguntas.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Confirma estos Datos:
            </h3>
            <div className="space-y-3">
              {preguntas
                .sort((a, b) => (a.Orden || 0) - (b.Orden || 0))
                .map((pregunta) => (
                  <div
                    key={pregunta.ID}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`pregunta-${pregunta.ID}`}
                      checked={respuestas[pregunta.ID] || false}
                      onCheckedChange={(checked: boolean) =>
                        handleQuestionChange(pregunta.ID, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`pregunta-${pregunta.ID}`}
                      className="text-sm font-normal"
                    >
                      {pregunta.Pregunta}
                    </Label>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Rating Concepts */}
        {conceptos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Califica nuestro servicio:
            </h3>
            <div className="space-y-6">
              {conceptos
                .sort((a, b) => (a.Orden || 0) - (b.Orden || 0))
                .map((concepto) => (
                  <div key={concepto.ID} className="text-center">
                    <h4 className="font-semibold mb-3">{concepto.Concepto}</h4>
                    <StarRating
                      rating={conformidad[concepto.ID] || 0}
                      onRatingChange={(rating) =>
                        handleRatingChange(concepto.ID, rating)
                      }
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                      Tu selección:{" "}
                      {conformidad[concepto.ID]
                        ? [
                            "Muy Desconforme",
                            "Desconforme",
                            "Neutro",
                            "Conforme",
                            "Muy Conforme",
                          ][conformidad[concepto.ID] - 1]
                        : "Sin seleccionar"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <Label htmlFor="comentarios">Tus comentarios:</Label>
          <Textarea
            id="comentarios"
            placeholder="ingresá tus comentarios"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={submitSurvey.isPending}
            className="px-8"
          >
            {submitSurvey.isPending ? "Enviando..." : "Confirmar y Calificar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
