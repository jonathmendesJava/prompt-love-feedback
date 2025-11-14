import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface CSATInputProps {
  question: Question;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function CSATInput({ question, value, onChange, disabled }: CSATInputProps) {
  const scale = question.scale_config?.csatScale || 5;
  const defaultLabels = {
    3: ["Insatisfeito", "Neutro", "Satisfeito"],
    5: ["Muito Insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito Satisfeito"],
    7: ["Muito Insatisfeito", "Insatisfeito", "Pouco Insatisfeito", "Neutro", "Pouco Satisfeito", "Satisfeito", "Muito Satisfeito"]
  };
  
  const labels = question.scale_config?.csatLabels || defaultLabels[scale];

  const emojis = {
    3: ["😞", "😐", "😄"],
    5: ["😡", "😞", "😐", "🙂", "😄"],
    7: ["😡", "😠", "😞", "😐", "🙂", "😊", "😄"]
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
        {Array.from({ length: scale }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !disabled && onChange(i + 1)}
            disabled={disabled}
            className={`rating-button flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-lg border-2 min-w-[60px] sm:min-w-[80px] ${
              value === i + 1
                ? "rating-button-selected bg-primary/10 text-primary border-primary"
                : "border-border bg-background hover:border-primary hover:bg-accent"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="text-2xl sm:text-3xl">{emojis[scale][i]}</span>
            <span className="text-[10px] sm:text-xs text-center font-medium leading-tight">{labels[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
