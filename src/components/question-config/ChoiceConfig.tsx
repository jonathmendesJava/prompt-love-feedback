import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { ScaleConfig } from "@/types/questions";

interface ChoiceConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
  isMultiple?: boolean;
}

export default function ChoiceConfig({ config, onChange, isMultiple }: ChoiceConfigProps) {
  const options = config.options || [""];

  const addOption = () => {
    onChange({
      ...config,
      options: [...options, ""]
    });
  };

  const removeOption = (index: number) => {
    onChange({
      ...config,
      options: options.filter((_, i) => i !== index)
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange({
      ...config,
      options: newOptions
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Opções de Resposta</Label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
              />
              {options.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Opção
        </Button>
      </div>

      {isMultiple && (
        <>
          <div className="space-y-2">
            <Label htmlFor="min-selections">Mínimo de Seleções</Label>
            <Input
              id="min-selections"
              type="number"
              min="0"
              max={options.length}
              value={config.minSelections || 0}
              onChange={(e) => onChange({
                ...config,
                minSelections: parseInt(e.target.value) || 0
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-selections">Máximo de Seleções</Label>
            <Input
              id="max-selections"
              type="number"
              min="1"
              max={options.length}
              value={config.maxSelections || options.length}
              onChange={(e) => onChange({
                ...config,
                maxSelections: parseInt(e.target.value) || options.length
              })}
            />
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        {isMultiple 
          ? "Permite selecionar múltiplas opções com validação"
          : "Permite selecionar apenas uma opção"}
      </p>
    </div>
  );
}
