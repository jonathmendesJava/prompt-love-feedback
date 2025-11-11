import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScaleConfig } from "@/types/questions";

interface EmojiConfigProps {
  config: ScaleConfig;
  onChange: (config: ScaleConfig) => void;
}

export default function EmojiConfig({ config, onChange }: EmojiConfigProps) {
  const emojiSets = {
    emotions: { label: "Emoções (padrão)", emojis: ["😡", "😞", "😐", "🙂", "😄"] },
    satisfaction: { label: "Satisfação", emojis: ["😠", "😕", "😐", "😊", "😍"] },
    quality: { label: "Qualidade", emojis: ["👎", "😕", "😐", "👍", "⭐"] },
  };

  const currentSet = Object.keys(emojiSets).find(key => 
    JSON.stringify(emojiSets[key as keyof typeof emojiSets].emojis) === JSON.stringify(config.emojiSet)
  ) || "emotions";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="emoji-set">Conjunto de Emojis</Label>
        <Select
          value={currentSet}
          onValueChange={(val) => onChange({
            ...config,
            emojiSet: emojiSets[val as keyof typeof emojiSets].emojis
          })}
        >
          <SelectTrigger id="emoji-set">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(emojiSets).map(([key, { label, emojis }]) => (
              <SelectItem key={key} value={key}>
                {label} {emojis.join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        Avaliação visual e intuitiva com emojis
      </p>
    </div>
  );
}
