"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Eye, Code } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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

const faqFormSchema = z.object({
  categoria: z.string().min(1, "Debe suministrar texto para la Categoría"),
  pregunta: z.string().min(1, "Debe suministrar texto para la pregunta"),
  respuesta: z.string().min(1, "Debe suministrar texto para la Respuesta"),
});

type FAQFormValues = z.infer<typeof faqFormSchema>;

export function FAQEditorModal({
  isOpen,
  onClose,
  onSave,
  faq,
  selectedCategory,
  isAdding = false,
}: FAQEditorModalProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      categoria: isAdding
        ? selectedCategory && selectedCategory !== "0"
          ? selectedCategory
          : ""
        : faq?.Categoria || "",
      pregunta: isAdding ? "" : faq?.Pregunta || "",
      respuesta: isAdding ? "" : faq?.Respuesta || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        categoria: isAdding
          ? selectedCategory && selectedCategory !== "0"
            ? selectedCategory
            : ""
          : faq?.Categoria || "",
        pregunta: isAdding ? "" : faq?.Pregunta || "",
        respuesta: isAdding ? "" : faq?.Respuesta || "",
      });
      setIsPreviewMode(false);
    }
  }, [isOpen, faq, selectedCategory, isAdding, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const onSubmit = (data: FAQFormValues) => {
    onSave({
      categoria: data.categoria.trim(),
      pregunta: data.pregunta.trim(),
      respuesta: data.respuesta.trim(),
    });
  };

  const handleCancel = () => {
    const hasChanges = form.formState.isDirty;

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría:</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese la categoría"
                      readOnly={!isAdding && selectedCategory !== "0"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pregunta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pregunta:</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ingrese la pregunta" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="respuesta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Respuesta:</FormLabel>
                  <Tabs
                    value={isPreviewMode ? "preview" : "edit"}
                    className="w-full"
                  >
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
                      <FormControl>
                        <textarea
                          {...field}
                          placeholder="Ingrese la respuesta (HTML permitido)"
                          className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                        />
                      </FormControl>
                    </TabsContent>
                    <TabsContent value="preview" className="mt-2">
                      <div className="min-h-[200px] p-4 border rounded-md bg-gray-50">
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: field.value }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex items-center gap-2">
                <Save size={16} />
                Actualizar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
