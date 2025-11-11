import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface CESInputProps {
  question: Question;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function CESInput({ question, value, onChange, disabled }: CESInputProps) {
  const scale = question.scale_config?.cesScale || 7;
  const labels = question.scale_config?.cesLabels || {
    min: "Muito Fácil",
    max: "Muito Difícil"
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: scale }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !disabled && onChange(i + 1)}
            disabled={disabled}
            className={`rating-button w-14 h-14 rounded-lg border-2 font-bold text-lg ${
              value === i + 1
                ? "rating-button-selected bg-primary text-primary-foreground border-primary"
                : "border-border bg-background hover:border-primary hover:bg-primary/10"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span className="text-green-600 dark:text-green-400 font-medium">{labels.min}</span>
        <span className="text-red-600 dark:text-red-400 font-medium">{labels.max}</span>
      </div>
    </div>
  );
}
