import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface NPSInputProps {
  question: Question;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function NPSInput({ question, value, onChange, disabled }: NPSInputProps) {
  const labels = question.scale_config?.npsLabels || {
    min: "Nada provável",
    max: "Extremamente provável"
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="grid grid-cols-6 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
        {Array.from({ length: 11 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !disabled && onChange(i)}
            disabled={disabled}
            className={`rating-button w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base rounded-md border-2 font-semibold transition-colors ${
              value === i
                ? "rating-button-selected bg-primary text-primary-foreground border-primary"
                : "border-border bg-background hover:border-primary hover:bg-primary/10"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] sm:text-xs text-muted-foreground px-1">
        <span>{labels.min}</span>
        <span>{labels.max}</span>
      </div>
    </div>
  );
}
