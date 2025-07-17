"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FAQItem {
  ID: number;
  Categoria: string;
  Pregunta: string;
  Respuesta: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  selectedIndex?: number;
  onItemClick?: (index: number) => void;
}

export function FAQAccordion({ faqs, selectedIndex, onItemClick }: FAQAccordionProps) {
  const [expandedItem, setExpandedItem] = useState<number | null>(selectedIndex ?? null);

  const handleItemClick = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index);
    onItemClick?.(index);
  };

  if (faqs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nada en esta categoría
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {faqs.map((faq, index) => (
        <div
          key={faq.ID}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <Button
            variant="ghost"
            onClick={() => handleItemClick(index)}
            className={cn(
              "w-full px-4 py-3 text-left flex items-center justify-between h-auto",
              "hover:bg-gray-50 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            )}
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {faq.Pregunta}
              </h3>
            </div>
            <div className="ml-4">
              {expandedItem === index ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </Button>
          
          {expandedItem === index && (
            <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
              <div
                className="text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: faq.Respuesta }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}