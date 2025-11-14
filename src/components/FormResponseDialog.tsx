import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Heart, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResponseDetail {
  id: string;
  question_text: string;
  question_type: string;
  response_text: string | null;
  response_value: number | null;
  response_data: any;
  scale_config?: any;
  order_index: number;
}

interface FormResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responses: ResponseDetail[];
  submittedAt: string;
}

export function FormResponseDialog({ open, onOpenChange, responses, submittedAt }: FormResponseDialogProps) {
  const renderResponse = (response: ResponseDetail) => {
    switch (response.question_type) {
      case "text":
        return (
          <p className="text-foreground bg-muted p-3 rounded-md">
            {response.response_text || "Sem resposta"}
          </p>
        );

      case "nps":
        const npsValue = response.response_value || 0;
        const npsType = npsValue >= 9 ? "😊 Promotor" : npsValue >= 7 ? "😐 Neutro" : "😞 Detrator";
        return (
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-primary">{npsValue}/10</div>
            <Badge variant={npsValue >= 9 ? "default" : npsValue >= 7 ? "secondary" : "destructive"}>
              {npsType}
            </Badge>
          </div>
        );

      case "csat":
      case "ces":
      case "likert":
        return (
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">{response.response_value}</div>
            <span className="text-muted-foreground">pontos</span>
          </div>
        );

      case "stars":
        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: response.response_value || 0 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({response.response_value}/{response.scale_config?.maxValue || 5})
            </span>
          </div>
        );

      case "hearts":
        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: response.response_value || 0 }).map((_, i) => (
                <Heart key={i} className="h-5 w-5 fill-red-500 text-red-500" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({response.response_value}/{response.scale_config?.maxValue || 5})
            </span>
          </div>
        );

      case "emojis":
        const emojiSet = response.scale_config?.emojiSet || ["😡", "😞", "😐", "🙂", "😄"];
        const emojiIndex = (response.response_value || 1) - 1;
        return (
          <div className="text-5xl">
            {emojiSet[emojiIndex]}
          </div>
        );

      case "like_dislike":
        return response.response_value === 1 ? (
          <div className="flex items-center gap-2 text-green-600">
            <ThumbsUp className="h-6 w-6" />
            <span className="font-medium">{response.scale_config?.likeLabel || "Gostei"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <ThumbsDown className="h-6 w-6" />
            <span className="font-medium">{response.scale_config?.dislikeLabel || "Não gostei"}</span>
          </div>
        );

      case "single_choice":
        return <Badge variant="secondary" className="text-base py-2 px-4">{response.response_text}</Badge>;

      case "multiple_choice":
        const multipleChoices = response.response_data || [];
        const options = response.scale_config?.options || [];
        return (
          <div className="flex flex-wrap gap-2">
            {multipleChoices.map((idx: number, i: number) => (
              <Badge key={i} variant="secondary">{options[idx]}</Badge>
            ))}
          </div>
        );

      case "matrix":
        const matrixData = response.response_data || {};
        const rows = response.scale_config?.matrixRows || [];
        const columns = response.scale_config?.matrixColumns || [];
        return (
          <div className="space-y-2">
            {Object.entries(matrixData).map(([rowIdx, colIdx]: [string, any]) => (
              <div key={rowIdx} className="flex items-center gap-2">
                <span className="text-sm font-medium">{rows[parseInt(rowIdx)]}:</span>
                <Badge variant="outline">{columns[colIdx]}</Badge>
              </div>
            ))}
          </div>
        );

      default:
        return <span className="text-muted-foreground">-</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Formulário</DialogTitle>
          <DialogDescription>
            Respondido em {new Date(submittedAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {responses.map((response, index) => (
            <div key={response.id} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-muted-foreground">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium">{response.question_text}</p>
                  <div className="mt-3">
                    {renderResponse(response)}
                  </div>
                </div>
              </div>
              {index < responses.length - 1 && <div className="border-b" />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
