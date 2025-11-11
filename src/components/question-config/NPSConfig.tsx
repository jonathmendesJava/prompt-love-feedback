import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScaleConfig } from "@/types/questions";

interface NPSConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}

export default function NPSConfig({ config, onChange }: NPSConfigProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nps-min-label">Label Mínimo (0)</Label>
        <Input
          id="nps-min-label"
          value={config.npsLabels?.min || "Nada provável"}
          onChange={(e) => onChange({
            ...config,
            npsLabels: { ...config.npsLabels, min: e.target.value, max: config.npsLabels?.max || "Extremamente provável" }
          })}
          placeholder="Ex: Nada provável"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nps-max-label">Label Máximo (10)</Label>
        <Input
          id="nps-max-label"
          value={config.npsLabels?.max || "Extremamente provável"}
          onChange={(e) => onChange({
            ...config,
            npsLabels: { min: config.npsLabels?.min || "Nada provável", max: e.target.value }
          })}
          placeholder="Ex: Extremamente provável"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        NPS usa uma escala fixa de 0 a 10
      </p>
    </div>
  );
}
