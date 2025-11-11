import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScaleConfig } from "@/types/questions";

interface StarsConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}

export default function StarsConfig({ config, onChange }: StarsConfigProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stars-max">Número de Estrelas</Label>
        <Select
          value={(config.maxValue || 5).toString()}
          onValueChange={(val) => onChange({
            ...config,
            maxValue: parseInt(val)
          })}
        >
          <SelectTrigger id="stars-max">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 estrelas</SelectItem>
            <SelectItem value="4">4 estrelas</SelectItem>
            <SelectItem value="5">5 estrelas (recomendado)</SelectItem>
            <SelectItem value="10">10 estrelas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        Sistema clássico de avaliação por estrelas
      </p>
    </div>
  );
}
