import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface MultipleChoiceInputProps {
  question: Question;
  value: number[] | null;
  onChange: (value: number[]) => void;
  disabled?: boolean;
}

export default function MultipleChoiceInput({ question, value, onChange, disabled }: MultipleChoiceInputProps) {
  const options = question.scale_config?.options || [];
  const minSelections = question.scale_config?.minSelections || 0;
  const maxSelections = question.scale_config?.maxSelections || options.length;
  const selectedIndices = value || [];

  const handleToggle = (index: number) => {
    if (disabled) return;
    
    const newValue = selectedIndices.includes(index)
      ? selectedIndices.filter(i => i !== index)
      : [...selectedIndices, index];

    // Validar max selections
    if (newValue.length <= maxSelections) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div
          key={index}
          className={`choice-option flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg border ${
            selectedIndices.includes(index) ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <Checkbox
            id={`option-${index}`}
            checked={selectedIndices.includes(index)}
            onCheckedChange={() => handleToggle(index)}
            disabled={disabled}
          />
          <Label
            htmlFor={`option-${index}`}
            className="flex-1 cursor-pointer font-normal text-sm sm:text-base"
          >
            {option}
          </Label>
        </div>
      ))}
      {(minSelections > 0 || maxSelections < options.length) && (
        <p className="text-xs text-muted-foreground mt-2">
          {minSelections > 0 && maxSelections < options.length
            ? `Selecione entre ${minSelections} e ${maxSelections} opções`
            : minSelections > 0
            ? `Selecione no mínimo ${minSelections} opção(ões)`
            : `Selecione no máximo ${maxSelections} opção(ões)`}
        </p>
      )}
    </div>
  );
}
