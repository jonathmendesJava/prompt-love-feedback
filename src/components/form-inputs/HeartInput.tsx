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
    <div className="flex gap-1.5 sm:gap-2 justify-center flex-wrap">
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
            className={`h-8 w-8 sm:h-10 sm:w-10 ${
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
