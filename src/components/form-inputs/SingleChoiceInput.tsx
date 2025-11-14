import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface SingleChoiceInputProps {
  question: Question;
  value: { index: number; text: string } | null;
  onChange: (value: { index: number; text: string }) => void;
  disabled?: boolean;
}

export default function SingleChoiceInput({ question, value, onChange, disabled }: SingleChoiceInputProps) {
  const options = question.scale_config?.options || [];

  return (
    <RadioGroup
      value={value?.index.toString()}
      onValueChange={(val) => {
        const index = parseInt(val);
        onChange({ index, text: options[index] });
      }}
      disabled={disabled}
      className="space-y-3"
    >
      {options.map((option, index) => (
        <div
          key={index}
          className={`choice-option flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg border ${
            value?.index === index ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
          <Label
            htmlFor={`option-${index}`}
            className="flex-1 cursor-pointer font-normal text-sm sm:text-base"
          >
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
