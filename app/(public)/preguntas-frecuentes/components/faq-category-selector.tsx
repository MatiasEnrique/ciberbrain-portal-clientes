"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  Categoria: string;
}

interface FAQCategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function FAQCategorySelector({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: FAQCategorySelectorProps) {
  return (
    <div className="flex items-center gap-4 justify-center">
      <label className="text-sm font-medium text-gray-700">
        Categoría:
      </label>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Seleccione Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Seleccione Categoría</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.Categoria} value={category.Categoria}>
              {category.Categoria}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}