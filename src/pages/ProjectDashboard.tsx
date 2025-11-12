import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Copy, Star, Eye, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormResponseDialog } from "@/components/FormResponseDialog";

interface FormSubmission {
  session_id: string;
  submitted_at: string;
  question_count: number;
  chatwoot_account_id?: string;
  chatwoot_conversation_id?: string;
}

interface ResponseDetail {
  id: string;
  question_text: string;
  question_type: string;
  response_text: string | null;
  response_value: number | null;
  response_data: any;
  scale_config?: any;
}

export default function ProjectDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionResponses, setSessionResponses] = useState<ResponseDetail[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (id) loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Buscar todas as respostas para calcular estatísticas
      const { data: allResponses, error: responsesError } = await supabase
        .from("responses")
        .select("session_id, response_value, submitted_at, chatwoot_account_id, chatwoot_conversation_id")
        .eq("project_id", id) as any;

      if (responsesError) throw responsesError;

      // Agrupar por session_id para contar formulários únicos
      const uniqueSessions = new Set(allResponses.map(r => r.session_id));
      
      // Calcular média de avaliações
      const ratings = allResponses
        .filter((r: any) => r.response_value)
        .map((r: any) => r.response_value);

      setStats({
        total: uniqueSessions.size,
        avgRating: ratings.length > 0
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : 0,
      });

      // Buscar submissions únicas com contagem de perguntas
      const submissionsMap = new Map<string, FormSubmission>();
      
      allResponses.forEach((r: any) => {
        if (!submissionsMap.has(r.session_id)) {
          submissionsMap.set(r.session_id, {
            session_id: r.session_id,
            submitted_at: r.submitted_at,
            question_count: 1,
            chatwoot_account_id: r.chatwoot_account_id,
            chatwoot_conversation_id: r.chatwoot_conversation_id,
          });
        } else {
          const existing = submissionsMap.get(r.session_id)!;
          existing.question_count += 1;
        }
      });

      const submissionsArray = Array.from(submissionsMap.values())
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

      setSubmissions(submissionsArray);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("responses")
        .select(`
          id,
          response_text,
          response_value,
          response_data,
          questions (
            question_text,
            question_type,
            scale_config,
            order_index
          )
        `)
        .eq("session_id", sessionId)
        .order("id");

      if (error) throw error;

      const formatted = data.map((r: any) => ({
        id: r.id,
        question_text: r.questions?.question_text || "Pergunta não encontrada",
        question_type: r.questions?.question_type || "text",
        response_text: r.response_text,
        response_value: r.response_value,
        response_data: r.response_data,
        scale_config: r.questions?.scale_config,
      }));

      setSessionResponses(formatted);
      setSelectedSession(sessionId);
      setDialogOpen(true);
    } catch (error: any) {
      toast.error("Erro ao carregar detalhes");
    }
  };

  const copyLink = () => {
    if (project) {
      const url = `${window.location.origin}/form/${project.link_unique}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{project?.name}</h1>
            <p className="text-muted-foreground mt-1">{project?.description}</p>
          </div>
          <Button onClick={copyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Formulários Respondidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Feedbacks recebidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">De 5 estrelas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulários Respondidos</CardTitle>
            <CardDescription>Todos os feedbacks enviados pelos clientes</CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum formulário respondido ainda
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Perguntas Respondidas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.session_id}>
                      <TableCell className="font-medium">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {submission.question_count} {submission.question_count === 1 ? 'pergunta' : 'perguntas'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {submission.chatwoot_conversation_id && submission.chatwoot_account_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(
                                `https://chatlink.fios.com.br/app/accounts/${submission.chatwoot_account_id}/conversations/${submission.chatwoot_conversation_id}`,
                                '_blank'
                              )}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Abrir ChatLink
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadSessionDetails(submission.session_id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <FormResponseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          responses={sessionResponses}
          submittedAt={submissions.find(s => s.session_id === selectedSession)?.submitted_at || ""}
        />
      </div>
    </DashboardLayout>
  );
}
