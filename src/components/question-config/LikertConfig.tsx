import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScaleConfig } from "@/types/questions";

interface LikertConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}

export default function LikertConfig({ config, onChange }: LikertConfigProps) {
  const scale = config.likertScale || 5;

  const defaultLabels = {
    5: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
    7: ["Discordo Totalmente", "Discordo", "Discordo Parcialmente", "Neutro", "Concordo Parcialmente", "Concordo", "Concordo Totalmente"]
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="likert-scale">Escala</Label>
        <Select
          value={scale.toString()}
          onValueChange={(val) => {
            const newScale = parseInt(val) as 5 | 7;
            onChange({
              ...config,
              likertScale: newScale,
              likertLabels: defaultLabels[newScale]
            });
          }}
        >
          <SelectTrigger id="likert-scale">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 pontos (recomendado)</SelectItem>
            <SelectItem value="7">7 pontos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        Escala Likert para medir concordância ou atitude
      </p>
    </div>
  );
}
