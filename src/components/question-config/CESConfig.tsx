import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScaleConfig } from "@/types/questions";

interface CESConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}

export default function CESConfig({ config, onChange }: CESConfigProps) {
  const scale = config.cesScale || 7;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ces-scale">Escala</Label>
        <Select
          value={scale.toString()}
          onValueChange={(val) => onChange({
            ...config,
            cesScale: parseInt(val) as 5 | 7
          })}
        >
          <SelectTrigger id="ces-scale">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 pontos</SelectItem>
            <SelectItem value="7">7 pontos (recomendado)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ces-min-label">Label Mínimo</Label>
        <Input
          id="ces-min-label"
          value={config.cesLabels?.min || "Muito Fácil"}
          onChange={(e) => onChange({
            ...config,
            cesLabels: { ...config.cesLabels, min: e.target.value, max: config.cesLabels?.max || "Muito Difícil" }
          })}
          placeholder="Ex: Muito Fácil"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ces-max-label">Label Máximo</Label>
        <Input
          id="ces-max-label"
          value={config.cesLabels?.max || "Muito Difícil"}
          onChange={(e) => onChange({
            ...config,
            cesLabels: { min: config.cesLabels?.min || "Muito Fácil", max: e.target.value }
          })}
          placeholder="Ex: Muito Difícil"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        CES mede o esforço necessário para completar uma tarefa
      </p>
    </div>
  );
}
