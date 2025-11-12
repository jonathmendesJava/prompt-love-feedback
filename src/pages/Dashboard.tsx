import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, FolderOpen, Star, TrendingUp } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: "Total de Projetos",
      value: stats?.totalProjects || 0,
      icon: FolderOpen,
      description: "Projetos criados",
      color: "text-primary",
    },
    {
      title: "Total de Respostas",
      value: stats?.totalResponses || 0,
      icon: BarChart3,
      description: "Feedbacks recebidos",
      color: "text-blue-500",
    },
    {
      title: "Avaliação Média",
      value: stats?.averageRating?.toFixed(1) || "0.0",
      icon: Star,
      description: "De 5 estrelas",
      color: "text-yellow-500",
    },
    {
      title: "Média de Respostas",
      value: stats && stats.totalProjects > 0 ? Math.round((stats.totalResponses / stats.totalProjects) * 10) / 10 : 0,
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
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-5 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            statCards.map((stat) => (
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
            ))
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao FiOS DizAí</CardTitle>
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
