import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Copy, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Response {
  id: string;
  question_text: string;
  response_text: string | null;
  response_value: number | null;
  submitted_at: string;
}

export default function ProjectDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);

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

      const { data: responsesData, error: responsesError } = await supabase
        .from("responses")
        .select(`
          id,
          response_text,
          response_value,
          submitted_at,
          questions (question_text)
        `)
        .eq("project_id", id)
        .order("submitted_at", { ascending: false });

      if (responsesError) throw responsesError;

      const formattedResponses = responsesData.map((r: any) => ({
        id: r.id,
        question_text: r.questions?.question_text || "Pergunta não encontrada",
        response_text: r.response_text,
        response_value: r.response_value,
        submitted_at: r.submitted_at,
      }));

      setResponses(formattedResponses);

      const ratings = responsesData
        .filter((r: any) => r.response_value)
        .map((r: any) => r.response_value);

      setStats({
        total: responsesData.length,
        avgRating: ratings.length > 0
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : 0,
      });
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      navigate("/projects");
    } finally {
      setLoading(false);
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
              <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
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
            <CardTitle>Respostas Recebidas</CardTitle>
            <CardDescription>Todos os feedbacks enviados pelos clientes</CardDescription>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma resposta recebida ainda
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pergunta</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">
                        {response.question_text}
                      </TableCell>
                      <TableCell>
                        {response.response_value ? (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: response.response_value }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {response.response_value}/5
                            </span>
                          </div>
                        ) : (
                          <span>{response.response_text || "-"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(response.submitted_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
