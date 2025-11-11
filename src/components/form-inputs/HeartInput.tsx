import { Heart } from "lucide-react";
import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface HeartInputProps {
  question: Question;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function HeartInput({ question, value, onChange, disabled }: HeartInputProps) {
  const maxHearts = question.scale_config?.maxValue || 5;

  return (
    <div className="flex gap-2">
      {Array.from({ length: maxHearts }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => !disabled && onChange(i + 1)}
          disabled={disabled}
          className={`rating-button transition-transform ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Heart
            className={`h-10 w-10 ${
              value && value > i
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
