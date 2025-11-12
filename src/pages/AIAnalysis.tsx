import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import AnalyticsDashboard from "@/components/ui/analytics-dashboard";
import { Sparkles, TrendingUp, AlertTriangle, ThumbsUp, Lightbulb, Download, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useNavigate } from "react-router-dom";

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
  const { preferences, loading: prefsLoading } = useUserPreferences();
  const navigate = useNavigate();

  const exportToCSV = () => {
    if (!analysis) return;

    const timestamp = new Date().toLocaleString('pt-BR');
    const lines: string[] = [];
    
    // Header
    lines.push('"Relatório de Análise de Feedbacks com IA"');
    lines.push(`"Data da Análise","${timestamp}"`);
    lines.push(`"Total de Respostas","${analysis.metrics.totalResponses}"`);
    lines.push('');
    
    // Metrics
    lines.push('"MÉTRICAS"');
    lines.push('"Métrica","Valor"');
    lines.push(`"Total de Respostas","${analysis.metrics.totalResponses}"`);
    lines.push(`"Avaliação Média","${analysis.metrics.averageRating.toFixed(1)}"`);
    lines.push(`"Feedbacks Positivos","${analysis.metrics.positiveCount}"`);
    lines.push(`"Feedbacks Negativos","${analysis.metrics.negativeCount}"`);
    lines.push('');
    
    // Summary
    lines.push('"RESUMO GERAL"');
    lines.push(`"${analysis.summary.replace(/"/g, '""')}"`);
    lines.push('');
    
    // Recommendations
    lines.push('"RECOMENDAÇÕES"');
    lines.push('"Nº","Recomendação"');
    analysis.recommendations.forEach((rec, idx) => {
      lines.push(`"${idx + 1}","${rec.replace(/"/g, '""')}"`);
    });
    lines.push('');
    
    // Negative Issues
    lines.push('"PONTOS DE ATENÇÃO"');
    lines.push('"Nº","Problema Identificado"');
    analysis.negativeIssues.forEach((issue, idx) => {
      lines.push(`"${idx + 1}","${issue.replace(/"/g, '""')}"`);
    });
    lines.push('');
    
    // Positive Highlights
    lines.push('"PONTOS POSITIVOS"');
    lines.push('"Nº","Destaque"');
    analysis.positiveHighlights.forEach((highlight, idx) => {
      lines.push(`"${idx + 1}","${highlight.replace(/"/g, '""')}"`);
    });
    
    // Create and download file
    const csvContent = lines.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `analise-feedback-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    
    // Use setTimeout to ensure click is processed before removing
    setTimeout(() => {
      try {
        // Check if link is still in DOM before removing
        if (link.parentNode) {
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('Erro ao remover elemento:', error);
      }
      // Clean up blob URL
      URL.revokeObjectURL(url);
    }, 100);
    
    toast.success("Relatório exportado com sucesso!");
  };

  const handleAnalyze = async () => {
    // Check if OpenAI token is configured
    if (!preferences.has_openai_key) {
      toast.error("Configure seu token OpenAI nas Configurações para usar esta funcionalidade", {
        action: {
          label: "Ir para Configurações",
          onClick: () => navigate("/settings")
        },
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar autenticado");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-responses', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error("Erro ao conectar com o servidor. Tente novamente.");
        setLoading(false);
        return;
      }

      if (data?.error) {
        const errorMsg = data.error;
        if (errorMsg.includes('Nenhuma resposta') || errorMsg.includes('No responses')) {
          toast.error("Nenhuma resposta encontrada para análise");
        } else if (errorMsg.includes('Token OpenAI não configurado')) {
          toast.error("Configure seu token OpenAI nas Configurações", {
            action: {
              label: "Configurações",
              onClick: () => navigate("/settings")
            },
            duration: 5000,
          });
        } else if (errorMsg.includes('Token OpenAI inválido') || errorMsg.includes('401')) {
          toast.error("Token OpenAI inválido. Verifique seu token nas Configurações", {
            action: {
              label: "Configurações",
              onClick: () => navigate("/settings")
            },
            duration: 5000,
          });
        } else if (errorMsg.includes('Limite') || errorMsg.includes('429')) {
          toast.error("Limite de requisições da OpenAI excedido. Tente novamente mais tarde.");
        } else if (errorMsg.includes('Créditos') || errorMsg.includes('402')) {
          toast.error("Créditos insuficientes na sua conta OpenAI. Adicione créditos em platform.openai.com.");
        } else {
          toast.error(errorMsg);
        }
        setLoading(false);
        return;
      }

      // Validate analysis data structure
      if (!data?.analysis) {
        toast.error("Resposta inválida do servidor");
        setLoading(false);
        return;
      }

      const validatedAnalysis: AnalysisResult = {
        summary: data.analysis.summary || "Análise não disponível",
        recommendations: Array.isArray(data.analysis.recommendations) ? data.analysis.recommendations : [],
        negativeIssues: Array.isArray(data.analysis.negativeIssues) ? data.analysis.negativeIssues : [],
        positiveHighlights: Array.isArray(data.analysis.positiveHighlights) ? data.analysis.positiveHighlights : [],
        metrics: {
          totalResponses: data.analysis.metrics?.totalResponses || 0,
          averageRating: data.analysis.metrics?.averageRating || 0,
          negativeCount: data.analysis.metrics?.negativeCount || 0,
          positiveCount: data.analysis.metrics?.positiveCount || 0,
        }
      };

      setAnalysis(validatedAnalysis);
      toast.success("Análise concluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao analisar:", error);
      toast.error(error?.message || "Erro ao realizar análise. Tente novamente.");
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
      value: analysis.metrics.totalResponses || 0,
      change: "Últimos 30 dias",
      changeType: "positive" as const,
      icon: TrendingUp,
      chartData: generateChartData(analysis.metrics.totalResponses || 0),
    },
    {
      title: "Avaliação Média",
      value: analysis.metrics.averageRating > 0 
        ? (analysis.metrics.averageRating).toFixed(1)
        : "N/A",
      change: `${analysis.metrics.positiveCount || 0} positivas`,
      changeType: "positive" as const,
      icon: ThumbsUp,
      chartData: analysis.metrics.averageRating > 0 
        ? generateChartData(analysis.metrics.averageRating * 10)
        : [],
    },
    {
      title: "Feedbacks Negativos",
      value: analysis.metrics.negativeCount || 0,
      change: analysis.metrics.totalResponses > 0 
        ? `${((analysis.metrics.negativeCount / analysis.metrics.totalResponses) * 100).toFixed(1)}% do total`
        : "0% do total",
      changeType: "negative" as const,
      icon: AlertTriangle,
      chartData: generateChartData(analysis.metrics.negativeCount || 0),
    },
    {
      title: "Feedbacks Positivos",
      value: analysis.metrics.positiveCount || 0,
      change: analysis.metrics.totalResponses > 0
        ? `${((analysis.metrics.positiveCount / analysis.metrics.totalResponses) * 100).toFixed(1)}% do total`
        : "0% do total",
      changeType: "positive" as const,
      icon: ThumbsUp,
      chartData: generateChartData(analysis.metrics.positiveCount || 0),
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
          <div className="flex gap-3">
            {analysis && (
              <Button onClick={exportToCSV} variant="outline" size="lg" className="gap-2">
                <Download className="h-5 w-5" />
                Exportar Relatório (CSV)
              </Button>
            )}
            <Button 
              onClick={handleAnalyze} 
              disabled={loading || prefsLoading || !preferences.has_openai_key} 
              size="lg" 
              className="gap-2"
            >
              <Sparkles className="h-5 w-5" />
              {loading ? "Analisando..." : "Analisar com IA"}
            </Button>
          </div>
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
                {!preferences.has_openai_key 
                  ? "Configure seu token OpenAI para começar"
                  : "Clique no botão acima para iniciar a análise com IA"}
              </p>
              {!preferences.has_openai_key && !prefsLoading && (
                <Button onClick={() => navigate("/settings")} variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Ir para Configurações
                </Button>
              )}
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
