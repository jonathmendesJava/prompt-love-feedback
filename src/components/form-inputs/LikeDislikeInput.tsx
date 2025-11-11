import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface LikeDislikeInputProps {
  question: Question;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function LikeDislikeInput({ question, value, onChange, disabled }: LikeDislikeInputProps) {
  const likeLabel = question.scale_config?.likeLabel || "Gostei";
  const dislikeLabel = question.scale_config?.dislikeLabel || "Não gostei";

  return (
    <div className="flex gap-4 justify-center">
      <button
        type="button"
        onClick={() => !disabled && onChange(1)}
        disabled={disabled}
        className={`like-dislike-button flex flex-col items-center gap-2 p-6 rounded-lg border-2 min-w-[120px] ${
          value === 1
            ? "like-dislike-button-selected bg-green-50 dark:bg-green-950 border-green-500 text-green-700 dark:text-green-300"
            : "border-border bg-background hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <ThumbsUp className="h-8 w-8" />
        <span className="font-medium">{likeLabel}</span>
      </button>

      <button
        type="button"
        onClick={() => !disabled && onChange(0)}
        disabled={disabled}
        className={`like-dislike-button flex flex-col items-center gap-2 p-6 rounded-lg border-2 min-w-[120px] ${
          value === 0
            ? "like-dislike-button-selected bg-red-50 dark:bg-red-950 border-red-500 text-red-700 dark:text-red-300"
            : "border-border bg-background hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <ThumbsDown className="h-8 w-8" />
        <span className="font-medium">{dislikeLabel}</span>
      </button>
    </div>
  );
}
