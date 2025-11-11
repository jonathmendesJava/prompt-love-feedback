import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "@/types/questions";
import "@/styles/question-inputs.css";

interface MatrixInputProps {
  question: Question;
  value: Record<string, number> | null;
  onChange: (value: Record<string, number>) => void;
  disabled?: boolean;
}

export default function MatrixInput({ question, value, onChange, disabled }: MatrixInputProps) {
  const rows = question.scale_config?.matrixRows || [];
  const columns = question.scale_config?.matrixColumns || [];
  const selections = value || {};

  const handleChange = (rowIndex: number, columnIndex: number) => {
    if (disabled) return;
    onChange({
      ...selections,
      [rowIndex]: columnIndex
    });
  };

  return (
    <div className="matrix-grid">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left border-b font-semibold text-sm"></th>
              {columns.map((col, i) => (
                <th key={i} className="p-3 text-center border-b font-semibold text-sm">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                <td className="p-3 font-medium text-sm">{row}</td>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="p-3 text-center">
                    <RadioGroup
                      value={selections[rowIndex]?.toString()}
                      onValueChange={(val) => handleChange(rowIndex, parseInt(val))}
                      disabled={disabled}
                    >
                      <div className="flex items-center justify-center">
                        <RadioGroupItem
                          value={colIndex.toString()}
                          id={`matrix-${rowIndex}-${colIndex}`}
                        />
                        <Label htmlFor={`matrix-${rowIndex}-${colIndex}`} className="sr-only">
                          {row} - {columns[colIndex]}
                        </Label>
                      </div>
                    </RadioGroup>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
