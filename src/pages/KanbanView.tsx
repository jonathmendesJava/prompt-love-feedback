import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Kanban, CardType } from "@/components/ui/kanban";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function KanbanView() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as respostas com informações do projeto
      const { data: responses, error } = await supabase
        .from("responses")
        .select(`
          id,
          session_id,
          submitted_at,
          response_data,
          response_text,
          response_value,
          project_id,
          question_id,
          projects (
            id,
            name
          ),
          questions (
            question_text,
            question_type
          )
        `)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Agrupar respostas por session_id
      const sessionMap = new Map<string, any>();
      
      responses?.forEach((response: any) => {
        if (!sessionMap.has(response.session_id)) {
          sessionMap.set(response.session_id, {
            id: response.session_id,
            column: "novo" as const,
            projectName: response.projects?.name || "Projeto Desconhecido",
            projectId: response.project_id,
            submittedAt: response.submitted_at,
            sessionId: response.session_id,
            responseData: [],
          });
        }
        
        sessionMap.get(response.session_id)?.responseData.push({
          question: response.questions?.question_text,
          questionType: response.questions?.question_type,
          value: response.response_value,
          text: response.response_text,
          data: response.response_data,
        });
      });

      const cardsData = Array.from(sessionMap.values());
      setCards(cardsData);
    } catch (error) {
      console.error("Erro ao carregar respostas:", error);
      toast.error("Erro ao carregar respostas");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
    setIsDialogOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const renderResponseValue = (response: any) => {
    if (response.value !== null && response.value !== undefined) {
      return response.value;
    }
    if (response.text) {
      return response.text;
    }
    if (response.data) {
      return JSON.stringify(response.data);
    }
    return "N/A";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gerenciamento de CTAs
          </h1>
          <p className="text-muted-foreground">
            Organize e gerencie as respostas recebidas dos formulários
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Carregando respostas...</p>
          </div>
        ) : (
          <div className="h-[calc(100vh-12rem)] border rounded-lg bg-card">
            <Kanban
              cards={cards}
              setCards={setCards}
              onCardClick={handleCardClick}
            />
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Resposta</DialogTitle>
            <DialogDescription>
              Informações completas sobre a resposta recebida
            </DialogDescription>
          </DialogHeader>

          {selectedCard && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Projeto
                    </p>
                    <p className="text-base">{selectedCard.projectName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Data e Hora
                    </p>
                    <p className="text-base">
                      {formatDate(selectedCard.submittedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      ID da Sessão
                    </p>
                    <p className="text-base font-mono text-xs">
                      {selectedCard.sessionId}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Respostas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCard.responseData?.map(
                      (response: any, index: number) => (
                        <div key={index}>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {response.question}
                            </p>
                            <p className="text-base text-muted-foreground">
                              {renderResponseValue(response)}
                            </p>
                          </div>
                          {index < selectedCard.responseData.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
