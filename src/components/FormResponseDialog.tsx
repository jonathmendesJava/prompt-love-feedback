import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";

interface ResponseDetail {
  id: string;
  question_text: string;
  question_type: string;
  response_text: string | null;
  response_value: number | null;
}

interface FormResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responses: ResponseDetail[];
  submittedAt: string;
}

export function FormResponseDialog({ open, onOpenChange, responses, submittedAt }: FormResponseDialogProps) {
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
                  <div className="mt-2">
                    {response.response_value ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: response.response_value }).map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({response.response_value}/5)
                        </span>
                      </div>
                    ) : (
                      <p className="text-foreground bg-muted p-3 rounded-md">
                        {response.response_text || "Sem resposta"}
                      </p>
                    )}
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
