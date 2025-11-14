import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface LikertInputProps {
  question: Question;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function LikertInput({ question, value, onChange, disabled }: LikertInputProps) {
  const scale = question.scale_config?.likertScale || 5;
  const defaultLabels = {
    5: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
    7: ["Discordo Totalmente", "Discordo", "Discordo Parcialmente", "Neutro", "Concordo Parcialmente", "Concordo", "Concordo Totalmente"]
  };
  
  const labels = question.scale_config?.likertLabels || defaultLabels[scale];

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {labels.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !disabled && onChange(i + 1)}
            disabled={disabled}
            className={`likert-button p-2.5 sm:p-3 rounded-lg border text-left font-medium text-sm sm:text-base ${
              value === i + 1
                ? "likert-button-selected"
                : "border-border bg-background"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
