import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ColumnType = "novo" | "em_analise" | "respondido" | "arquivado";

export interface CardType {
  id: string;
  column: ColumnType;
  projectName: string;
  projectId: string;
  submittedAt: string;
  sessionId: string;
  responseData: Array<{
    question_text: string;
    question_type: string;
    response_text?: string;
    response_value?: number;
    response_data?: any;
  }>;
}

export function useKanbanCards() {
  return useQuery({
    queryKey: ["kanban-cards"],
    queryFn: async (): Promise<CardType[]> => {
      const { data, error } = await supabase
        .from("responses")
        .select(`
          session_id,
          submitted_at,
          response_text,
          response_value,
          response_data,
          project_id,
          projects(name),
          questions(question_text, question_type)
        `)
        .order("submitted_at", { ascending: false })
        .limit(200); // Limit to last 200 responses for performance

      if (error) throw error;

      // Group by session_id
      const sessionMap = new Map<string, any>();
      
      (data || []).forEach((response: any) => {
        const sessionId = response.session_id;
        
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, {
            sessionId,
            projectName: response.projects?.name || "Projeto Desconhecido",
            projectId: response.project_id,
            submittedAt: response.submitted_at,
            responses: []
          });
        }
        
        sessionMap.get(sessionId).responses.push({
          question_text: response.questions?.question_text || "Pergunta",
          question_type: response.questions?.question_type || "text",
          response_text: response.response_text,
          response_value: response.response_value,
          response_data: response.response_data
        });
      });

      // Convert to CardType array
      return Array.from(sessionMap.values()).map((session) => ({
        id: session.sessionId,
        column: "novo" as ColumnType,
        projectName: session.projectName,
        projectId: session.projectId,
        submittedAt: session.submittedAt,
        sessionId: session.sessionId,
        responseData: session.responses
      }));
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
