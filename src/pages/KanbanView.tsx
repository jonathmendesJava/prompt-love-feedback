import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Kanban, CardType } from "@/components/ui/kanban";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useKanbanCards } from "@/hooks/useKanbanCards";

export default function KanbanView() {
  const { data: fetchedCards = [], isLoading, error } = useKanbanCards();
  const [localCards, setLocalCards] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sync fetched cards to local state
  useEffect(() => {
    if (fetchedCards.length > 0) {
      setLocalCards(fetchedCards);
    }
  }, [fetchedCards]);

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

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-destructive">Erro ao carregar respostas</p>
          </div>
        ) : (
          <div className="h-[calc(100vh-12rem)] border rounded-lg bg-card">
            <Kanban
              cards={localCards.length > 0 ? localCards : fetchedCards}
              setCards={setLocalCards}
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
                              {response.question_text}
                            </p>
                            <p className="text-base text-muted-foreground">
                              {renderResponseValue({
                                value: response.response_value,
                                text: response.response_text,
                                data: response.response_data
                              })}
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
