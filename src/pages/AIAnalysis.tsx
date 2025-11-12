import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import AnalyticsDashboard from "@/components/ui/analytics-dashboard";
import { Sparkles, TrendingUp, AlertTriangle, ThumbsUp, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  summary: string;
  recommendations: string[];
  negativeIssues: string[];
  positiveHighlights: string[];
  metrics: {
    totalResponses: number;
    averageRating: number;
    negativeCount: number;
    positiveCount: number;
  };
}

export default function AIAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar autenticado");
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-responses', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAnalysis(data.analysis);
      toast.success("Análise concluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao analisar:", error);
      toast.error("Erro ao realizar análise");
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (baseValue: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      name: `Dia ${i + 1}`,
      uv: Math.floor(baseValue * (0.8 + Math.random() * 0.4))
    }));
  };

  const dashboardData = analysis ? [
    {
      title: "Total de Respostas",
      value: analysis.metrics.totalResponses,
      change: "Últimos 30 dias",
      changeType: "positive" as const,
      icon: TrendingUp,
      chartData: generateChartData(analysis.metrics.totalResponses),
    },
    {
      title: "Avaliação Média",
      value: analysis.metrics.averageRating.toFixed(1),
      change: `${analysis.metrics.positiveCount} positivas`,
      changeType: "positive" as const,
      icon: ThumbsUp,
      chartData: generateChartData(analysis.metrics.averageRating * 20),
    },
    {
      title: "Feedbacks Negativos",
      value: analysis.metrics.negativeCount,
      change: `${((analysis.metrics.negativeCount / analysis.metrics.totalResponses) * 100).toFixed(1)}% do total`,
      changeType: "negative" as const,
      icon: AlertTriangle,
      chartData: generateChartData(analysis.metrics.negativeCount),
    },
    {
      title: "Feedbacks Positivos",
      value: analysis.metrics.positiveCount,
      change: `${((analysis.metrics.positiveCount / analysis.metrics.totalResponses) * 100).toFixed(1)}% do total`,
      changeType: "positive" as const,
      icon: ThumbsUp,
      chartData: generateChartData(analysis.metrics.positiveCount),
    },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análise de Dados com IA</h1>
            <p className="text-muted-foreground mt-2">
              Análise inteligente de todos os feedbacks recebidos
            </p>
          </div>
          <Button onClick={handleAnalyze} disabled={loading} size="lg" className="gap-2">
            <Sparkles className="h-5 w-5" />
            {loading ? "Analisando..." : "Analisar com IA"}
          </Button>
        </div>

        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {!loading && !analysis && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                Nenhuma análise realizada ainda
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Clique no botão acima para iniciar a análise com IA
              </p>
            </CardContent>
          </Card>
        )}

        {analysis && (
          <>
            <AnalyticsDashboard data={dashboardData} />

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Recomendações da IA
                  </CardTitle>
                  <CardDescription>
                    Dicas para melhorar o atendimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.recommendations.length > 0 ? (
                    analysis.recommendations.map((rec, index) => (
                      <Alert key={index} className="bg-primary/5 border-primary/20">
                        <AlertDescription className="text-sm">
                          {rec}
                        </AlertDescription>
                      </Alert>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma recomendação específica</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Pontos de Atenção
                  </CardTitle>
                  <CardDescription>
                    Problemas identificados nos feedbacks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.negativeIssues.length > 0 ? (
                    analysis.negativeIssues.map((issue, index) => (
                      <Alert key={index} variant="destructive" className="bg-destructive/5">
                        <AlertDescription className="text-sm">
                          {issue}
                        </AlertDescription>
                      </Alert>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum problema identificado</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-primary" />
                  Pontos Positivos
                </CardTitle>
                <CardDescription>
                  Aspectos destacados pelos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {analysis.positiveHighlights.length > 0 ? (
                    analysis.positiveHighlights.map((highlight, index) => (
                      <Alert key={index} className="bg-primary/5 border-primary/20">
                        <AlertDescription className="text-sm">
                          {highlight}
                        </AlertDescription>
                      </Alert>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum destaque específico</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo da Análise</CardTitle>
                <CardDescription>
                  Visão geral gerada pela IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {analysis.summary}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
