import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export interface TruthTableRow {
  inputs: string;
  expectedOutput: string;
  observedOutput: string;
}

interface TruthTableInputProps {
  rows: TruthTableRow[];
  onRowsChange: (rows: TruthTableRow[]) => void;
}

export const TruthTableInput = ({ rows, onRowsChange }: TruthTableInputProps) => {
  const addRow = () => {
    onRowsChange([...rows, { inputs: "", expectedOutput: "", observedOutput: "" }]);
  };

  const removeRow = (index: number) => {
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof TruthTableRow, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    onRowsChange(newRows);
  };

  return (
    <Card className="p-6 bg-card border-[hsl(var(--table-border))]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-[hsl(var(--table-header))]">Truth Table</h3>
          <p className="text-sm text-[hsl(var(--table-label))] mt-1">
            Enter your circuit inputs and compare expected vs observed outputs
          </p>
        </div>
        <Button 
          onClick={addRow}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>

      <div className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 pb-3 border-b-2 border-[hsl(var(--table-border))]">
          <Label className="text-sm font-semibold text-[hsl(var(--table-label))] uppercase tracking-wider">Inputs (e.g., 00, 01)</Label>
          <Label className="text-sm font-semibold text-[hsl(var(--table-label))] uppercase tracking-wider">Expected</Label>
          <Label className="text-sm font-semibold text-[hsl(var(--table-label))] uppercase tracking-wider">Observed</Label>
          <div className="w-10"></div>
        </div>

        {/* Rows */}
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center">
            <Input
              value={row.inputs}
              onChange={(e) => updateRow(index, "inputs", e.target.value)}
              placeholder="e.g., 00, 01, 10, 11"
              className="font-mono text-base bg-[hsl(var(--table-input-bg))] border-[hsl(var(--table-border))] focus:border-primary text-[hsl(var(--table-header))]"
            />
            <Input
              value={row.expectedOutput}
              onChange={(e) => updateRow(index, "expectedOutput", e.target.value)}
              placeholder="0 or 1"
              className="font-mono text-base bg-[hsl(var(--table-input-bg))] border-[hsl(var(--table-border))] focus:border-primary text-[hsl(var(--table-header))]"
              maxLength={1}
            />
            <Input
              value={row.observedOutput}
              onChange={(e) => updateRow(index, "observedOutput", e.target.value)}
              placeholder="0 or 1"
              className={`font-mono text-base bg-[hsl(var(--table-input-bg))] border-2 focus:border-primary text-[hsl(var(--table-header))] ${
                row.expectedOutput && row.observedOutput && row.expectedOutput !== row.observedOutput
                  ? "border-destructive"
                  : "border-[hsl(var(--table-border))]"
              }`}
              maxLength={1}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRow(index)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-center py-12 text-[hsl(var(--table-label))]">
            No rows yet. Click "Add Row" to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
