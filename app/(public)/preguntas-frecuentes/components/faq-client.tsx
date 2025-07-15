"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FAQAccordion } from "@/app/(public)/preguntas-frecuentes/components/faq-accordion";
import { FAQCategorySelector } from "@/app/(public)/preguntas-frecuentes/components/faq-category-selector";
import { FAQEditorModal } from "@/app/(public)/preguntas-frecuentes/components/faq-editor-modal";
import { FAQDeleteDialog } from "@/components/faq/faq-delete-dialog";
import { FAQSkeleton } from "@/components/faq/faq-skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { isAdmin } from "@/lib/editable-text";
import { toast } from "sonner";

interface FAQItem {
  ID: number;
  Categoria: string;
  Pregunta: string;
  Respuesta: string;
}

interface Category {
  Categoria: string;
}

export function FAQClient() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("0");
  const [selectedFAQIndex, setSelectedFAQIndex] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const userIsAdmin = session?.user?.id
    ? isAdmin(parseInt(session.user.id))
    : false;

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["faq-categories"],
    queryFn: async () => {
      const response = await fetch("/api/faq/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const { 
    data: faqs = [], 
    refetch: refetchFAQs, 
    isLoading: isLoadingFAQs,
    error: faqsError 
  } = useQuery<FAQItem[]>({
    queryKey: ["faqs", selectedCategory],
    queryFn: async () => {
      const response = await fetch(`/api/faq?categoria=${selectedCategory}`);
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      return response.json();
    },
    enabled: selectedCategory !== "0",
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedFAQIndex(null);
  };

  const handleFAQClick = (index: number) => {
    setSelectedFAQIndex(index);
  };

  const handleAddFAQ = () => {
    setIsAdding(true);
    setIsEditorOpen(true);
  };

  const handleEditFAQ = () => {
    if (selectedFAQIndex === null) return;
    setIsAdding(false);
    setIsEditorOpen(true);
  };

  const deleteFAQMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "QDel",
          id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al borrar la pregunta");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Pregunta borrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["faqs", selectedCategory] });
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      setSelectedFAQIndex(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteFAQ = () => {
    if (selectedFAQIndex === null) return;
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedFAQIndex === null) return;
    deleteFAQMutation.mutate(faqs[selectedFAQIndex].ID);
    setIsDeleteDialogOpen(false);
  };

  const saveFAQMutation = useMutation({
    mutationFn: async (params: {
      action: string;
      id: number;
      categoria: string;
      pregunta: string;
      respuesta: string;
    }) => {
      const response = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar la pregunta");
      }

      return response.json();
    },
    onSuccess: async (_, variables) => {
      const message =
        variables.action === "QAdd"
          ? "Pregunta agregada correctamente"
          : "Pregunta actualizada correctamente";
      toast.success(message);

      await queryClient.invalidateQueries({ queryKey: ["faq-categories"] });

      setIsEditorOpen(false);

      if (
        variables.action === "QAdd" &&
        variables.categoria !== selectedCategory
      ) {
        setSelectedCategory(variables.categoria);
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["faqs", variables.categoria],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSaveFAQ = (data: {
    categoria: string;
    pregunta: string;
    respuesta: string;
  }) => {
    const action = isAdding ? "QAdd" : "QEdit";
    const id = isAdding ? 0 : faqs[selectedFAQIndex!].ID;

    saveFAQMutation.mutate({
      action,
      id,
      categoria: data.categoria,
      pregunta: data.pregunta,
      respuesta: data.respuesta,
    });
  };

  return (
    <>
      <div className="mb-8">
        <FAQCategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>
      {userIsAdmin && (
        <div className="flex gap-2 mb-6 justify-center">
          <Button onClick={handleAddFAQ} className="flex items-center gap-2">
            <Plus size={16} />
            Agregar Pregunta
          </Button>
          <Button
            onClick={handleEditFAQ}
            disabled={selectedFAQIndex === null || faqs.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Modificar Pregunta
          </Button>
          <Button
            onClick={handleDeleteFAQ}
            disabled={selectedFAQIndex === null || faqs.length === 0}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Borrar Pregunta
          </Button>
        </div>
      )}

      <div className="mb-8">
        {selectedCategory === "0" ? (
          <div className="text-center py-8 text-gray-500">
            Seleccione una categoría para ver las preguntas frecuentes
          </div>
        ) : isLoadingFAQs ? (
          <FAQSkeleton />
        ) : faqsError ? (
          <div className="text-center py-8 text-red-500">
            Error al cargar las preguntas frecuentes
          </div>
        ) : (
          <FAQAccordion
            faqs={faqs}
            selectedIndex={selectedFAQIndex ?? undefined}
            onItemClick={handleFAQClick}
          />
        )}
      </div>

      <FAQEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveFAQ}
        faq={selectedFAQIndex !== null ? faqs[selectedFAQIndex] : undefined}
        selectedCategory={selectedCategory}
        isAdding={isAdding}
      />

      <FAQDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        questionText={
          selectedFAQIndex !== null ? faqs[selectedFAQIndex]?.Pregunta || "" : ""
        }
        isLoading={deleteFAQMutation.isPending}
      />
    </>
  );
}
