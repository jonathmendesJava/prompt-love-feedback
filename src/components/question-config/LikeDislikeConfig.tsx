import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScaleConfig } from "@/types/questions";

interface LikeDislikeConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}

export default function LikeDislikeConfig({ config, onChange }: LikeDislikeConfigProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="like-label">Label do "Gostei"</Label>
        <Input
          id="like-label"
          value={config.likeLabel || "Gostei"}
          onChange={(e) => onChange({
            ...config,
            likeLabel: e.target.value
          })}
          placeholder="Ex: Gostei"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dislike-label">Label do "Não Gostei"</Label>
        <Input
          id="dislike-label"
          value={config.dislikeLabel || "Não gostei"}
          onChange={(e) => onChange({
            ...config,
            dislikeLabel: e.target.value
          })}
          placeholder="Ex: Não gostei"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Resposta binária simples e direta
      </p>
    </div>
  );
}
