"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PrintFormat {
  ID: number;
  Formato: string;
  Tipo: number;
}

interface BudgetSectionProps {
  workOrderId: number;
  formatos: PrintFormat[];
}

export function BudgetSection({ workOrderId, formatos }: BudgetSectionProps) {
  if (formatos.length === 0) return null;

  const handleViewBudget = (formato: string) => {
    const url = `/frmComprobante.aspx?IDComprobante=${workOrderId}&Comprobante=Orden&Formato=${formato}&Copias=1`;
    window.open(url, 'Presupuesto', 'width=800,height=600');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuesto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {formatos.map((formato) => (
            <div key={formato.ID}>
              <Button
                variant="link"
                onClick={() => handleViewBudget(formato.Formato)}
                className="h-auto p-0 text-left"
              >
                Mirá tu Presupuesto haciendo click
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}