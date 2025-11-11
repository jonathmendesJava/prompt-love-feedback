import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScaleConfig } from "@/types/questions";

interface CSATConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}

export default function CSATConfig({ config, onChange }: CSATConfigProps) {
  const scale = config.csatScale || 5;

  const defaultLabels = {
    3: ["Insatisfeito", "Neutro", "Satisfeito"],
    5: ["Muito Insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito Satisfeito"],
    7: ["Muito Insatisfeito", "Insatisfeito", "Pouco Insatisfeito", "Neutro", "Pouco Satisfeito", "Satisfeito", "Muito Satisfeito"]
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="csat-scale">Escala</Label>
        <Select
          value={scale.toString()}
          onValueChange={(val) => {
            const newScale = parseInt(val) as 3 | 5 | 7;
            onChange({
              ...config,
              csatScale: newScale,
              csatLabels: defaultLabels[newScale]
            });
          }}
        >
          <SelectTrigger id="csat-scale">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 pontos</SelectItem>
            <SelectItem value="5">5 pontos (recomendado)</SelectItem>
            <SelectItem value="7">7 pontos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        CSAT mede a satisfação do cliente com uma escala configurável
      </p>
    </div>
  );
}
