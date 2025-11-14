import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface EmojiInputProps {
  question: Question;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function EmojiInput({ question, value, onChange, disabled }: EmojiInputProps) {
  const defaultEmojis = ["😡", "😞", "😐", "🙂", "😄"];
  const emojis = question.scale_config?.emojiSet || defaultEmojis;

  return (
    <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
      {emojis.map((emoji, i) => (
        <button
          key={i}
          type="button"
          onClick={() => !disabled && onChange(i + 1)}
          disabled={disabled}
          className={`emoji-button text-3xl sm:text-4xl md:text-5xl p-1.5 sm:p-2 rounded-lg ${
            value === i + 1 ? "emoji-button-selected" : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
