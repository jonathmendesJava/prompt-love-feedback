import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { ScaleConfig } from "@/types/questions";

interface MatrixConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}

export default function MatrixConfig({ config, onChange }: MatrixConfigProps) {
  const rows = config.matrixRows || [""];
  const columns = config.matrixColumns || [""];

  const addRow = () => {
    onChange({
      ...config,
      matrixRows: [...rows, ""]
    });
  };

  const removeRow = (index: number) => {
    onChange({
      ...config,
      matrixRows: rows.filter((_, i) => i !== index)
    });
  };

  const updateRow = (index: number, value: string) => {
    const newRows = [...rows];
    newRows[index] = value;
    onChange({
      ...config,
      matrixRows: newRows
    });
  };

  const addColumn = () => {
    onChange({
      ...config,
      matrixColumns: [...columns, ""]
    });
  };

  const removeColumn = (index: number) => {
    onChange({
      ...config,
      matrixColumns: columns.filter((_, i) => i !== index)
    });
  };

  const updateColumn = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = value;
    onChange({
      ...config,
      matrixColumns: newColumns
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Perguntas da Matriz (Linhas)</Label>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={row}
                onChange={(e) => updateRow(index, e.target.value)}
                placeholder={`Pergunta ${index + 1}`}
              />
              {rows.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Pergunta
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Opções de Resposta (Colunas)</Label>
        <div className="space-y-2">
          {columns.map((column, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={column}
                onChange={(e) => updateColumn(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
              />
              {columns.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeColumn(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addColumn} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Opção
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Matriz para avaliar múltiplas perguntas com as mesmas opções
      </p>
    </div>
  );
}
