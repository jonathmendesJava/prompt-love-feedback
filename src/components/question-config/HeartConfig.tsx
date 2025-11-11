import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScaleConfig } from "@/types/questions";

interface HeartConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}

export default function HeartConfig({ config, onChange }: HeartConfigProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hearts-max">Número de Corações</Label>
        <Select
          value={(config.maxValue || 5).toString()}
          onValueChange={(val) => onChange({
            ...config,
            maxValue: parseInt(val)
          })}
        >
          <SelectTrigger id="hearts-max">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 corações</SelectItem>
            <SelectItem value="5">5 corações (recomendado)</SelectItem>
            <SelectItem value="10">10 corações</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        Avaliação com corações, ideal para conteúdo emocional
      </p>
    </div>
  );
}
