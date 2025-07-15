"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Eye, Code } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface FAQItem {
  ID: number;
  Categoria: string;
  Pregunta: string;
  Respuesta: string;
}

interface FAQEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    categoria: string;
    pregunta: string;
    respuesta: string;
  }) => void;
  faq?: FAQItem;
  selectedCategory?: string;
  isAdding?: boolean;
}

export function FAQEditorModal({
  isOpen,
  onClose,
  onSave,
  faq,
  selectedCategory,
  isAdding = false,
}: FAQEditorModalProps) {
  const getInitialValues = () => {
    if (isAdding) {
      return {
        categoria:
          selectedCategory && selectedCategory !== "0" ? selectedCategory : "",
        pregunta: "",
        respuesta: "",
      };
    } else {
      return {
        categoria: faq?.Categoria || "",
        pregunta: faq?.Pregunta || "",
        respuesta: faq?.Respuesta || "",
      };
    }
  };

  const [categoria, setCategoria] = useState("");
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else {
      const initialValues = getInitialValues();
      setCategoria(initialValues.categoria);
      setPregunta(initialValues.pregunta);
      setRespuesta(initialValues.respuesta);
      setIsPreviewMode(false);
    }
  };

  const handleSave = () => {
    if (!categoria.trim()) {
      toast.error("Debe suministrar texto para la Categoría");
      return;
    }
    if (!pregunta.trim()) {
      toast.error("Debe suministrar texto para la pregunta");
      return;
    }
    if (!respuesta.trim()) {
      toast.error("Debe suministrar texto para la Respuesta");
      return;
    }

    onSave({
      categoria: categoria.trim(),
      pregunta: pregunta.trim(),
      respuesta: respuesta.trim(),
    });
  };

  const handleCancel = () => {
    const initialValues = getInitialValues();
    const hasChanges =
      categoria !== initialValues.categoria ||
      pregunta !== initialValues.pregunta ||
      respuesta !== initialValues.respuesta;

    if (hasChanges) {
      if (confirm("¿Seguro de abandonar?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAdding ? "Agregando" : "Editando"} pregunta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría:</Label>
            <Input
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ingrese la categoría"
              readOnly={!isAdding && selectedCategory !== "0"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pregunta">Pregunta:</Label>
            <Input
              id="pregunta"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="Ingrese la pregunta"
            />
          </div>

          <div className="space-y-2">
            <Label>Respuesta:</Label>
            <Tabs value={isPreviewMode ? "preview" : "edit"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="edit"
                  onClick={() => setIsPreviewMode(false)}
                  className="flex items-center gap-2"
                >
                  <Code size={14} />
                  Editar
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  onClick={() => setIsPreviewMode(true)}
                  className="flex items-center gap-2"
                >
                  <Eye size={14} />
                  Vista previa
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-2">
                <Textarea
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Ingrese la respuesta (HTML permitido)"
                  className="min-h-[200px] font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div className="min-h-[200px] p-4 border rounded-md bg-gray-50">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: respuesta }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save size={16} />
              Actualizar
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
