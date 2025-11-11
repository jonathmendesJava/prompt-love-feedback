import { Question } from "@/types/questions";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import NPSInput from "./form-inputs/NPSInput";
import CSATInput from "./form-inputs/CSATInput";
import CESInput from "./form-inputs/CESInput";
import EmojiInput from "./form-inputs/EmojiInput";
import HeartInput from "./form-inputs/HeartInput";
import LikeDislikeInput from "./form-inputs/LikeDislikeInput";
import SingleChoiceInput from "./form-inputs/SingleChoiceInput";
import MultipleChoiceInput from "./form-inputs/MultipleChoiceInput";
import LikertInput from "./form-inputs/LikertInput";
import MatrixInput from "./form-inputs/MatrixInput";

interface QuestionPreviewProps {
  question: Question;
  index: number;
}

export default function QuestionPreview({ question, index }: QuestionPreviewProps) {
  const renderInput = () => {
    switch (question.question_type) {
      case "text":
        return (
          <Textarea
            placeholder="Digite sua resposta..."
            disabled
            rows={4}
            className="resize-none"
          />
        );

      case "stars":
        return (
          <div className="flex gap-2">
            {Array.from({ length: question.scale_config?.maxValue || 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-8 w-8 text-muted-foreground"
              />
            ))}
          </div>
        );

      case "nps":
        return <NPSInput question={question} value={null} onChange={() => {}} disabled />;

      case "csat":
        return <CSATInput question={question} value={null} onChange={() => {}} disabled />;

      case "ces":
        return <CESInput question={question} value={null} onChange={() => {}} disabled />;

      case "emojis":
        return <EmojiInput question={question} value={null} onChange={() => {}} disabled />;

      case "hearts":
        return <HeartInput question={question} value={null} onChange={() => {}} disabled />;

      case "like_dislike":
        return <LikeDislikeInput question={question} value={null} onChange={() => {}} disabled />;

      case "single_choice":
        return <SingleChoiceInput question={question} value={null} onChange={() => {}} disabled />;

      case "multiple_choice":
        return <MultipleChoiceInput question={question} value={null} onChange={() => {}} disabled />;

      case "likert":
        return <LikertInput question={question} value={null} onChange={() => {}} disabled />;

      case "matrix":
        return <MatrixInput question={question} value={null} onChange={() => {}} disabled />;

      default:
        return <p className="text-muted-foreground text-sm">Selecione um tipo de pergunta</p>;
    }
  };

  return (
    <div className="space-y-4 p-6 rounded-lg border bg-card">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Pergunta {index + 1}</p>
        <h3 className="text-lg font-semibold">
          {question.question_text || "Digite o texto da pergunta..."}
        </h3>
      </div>
      <div className="pt-2">
        {renderInput()}
      </div>
      <p className="text-xs text-muted-foreground italic">
        💡 Esta é uma pré-visualização de como a pergunta aparecerá no formulário
      </p>
    </div>
  );
}
