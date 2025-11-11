import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FolderOpen, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalResponses: 0,
    averageRating: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: projects } = await supabase
      .from("projects")
      .select("id");

    const { data: responses } = await supabase
      .from("responses")
      .select("session_id, response_value");

    const totalProjects = projects?.length || 0;
    
    // Count unique session_ids (unique form submissions)
    const uniqueSessions = new Set(responses?.map(r => r.session_id) || []).size;
    const totalResponses = uniqueSessions;
    
    const ratings = responses?.filter(r => r.response_value).map(r => r.response_value) || [];
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    setStats({ totalProjects, totalResponses, averageRating });
  };

  const statCards = [
    {
      title: "Total de Projetos",
      value: stats.totalProjects,
      icon: FolderOpen,
      description: "Projetos criados",
      color: "text-primary",
    },
    {
      title: "Total de Respostas",
      value: stats.totalResponses,
      icon: BarChart3,
      description: "Feedbacks recebidos",
      color: "text-blue-500",
    },
    {
      title: "Avaliação Média",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      description: "De 5 estrelas",
      color: "text-yellow-500",
    },
    {
      title: "Média de Respostas",
      value: stats.totalProjects > 0 ? Math.round((stats.totalResponses / stats.totalProjects) * 10) / 10 : 0,
      icon: TrendingUp,
      description: "Por projeto criado",
      color: "text-green-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral do sistema de avaliação
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao FIOS SayIt</CardTitle>
            <CardDescription>
              Gerencie seus projetos de avaliação de atendimento de forma simples e eficiente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Crie Projetos de Avaliação</h3>
                <p className="text-sm text-muted-foreground">
                  Configure formulários personalizados com perguntas e escalas de avaliação
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Colete Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhe links únicos e receba avaliações dos seus clientes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Analise Resultados</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize estatísticas, gráficos e insights dos feedbacks recebidos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
