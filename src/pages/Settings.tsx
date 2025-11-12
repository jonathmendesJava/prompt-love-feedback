import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Shield, User, Sparkles, Info, Key, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { preferences, loading, saving, updatePreference, updateOpenAIToken, removeOpenAIToken } = useUserPreferences();
  const [openaiToken, setOpenaiToken] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>
              Personalize a aparência da interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Modo Escuro</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Alterne entre tema claro e escuro
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configure como você deseja ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[300px]" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[300px]" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>Notificações por Email</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receba atualizações importantes por email
                    </span>
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => updatePreference("email_notifications", checked)}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports" className="flex flex-col space-y-1">
                    <span>Relatórios Semanais</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receba um resumo semanal das suas avaliações
                    </span>
                  </Label>
                  <Switch
                    id="weekly-reports"
                    checked={preferences.weekly_reports}
                    onCheckedChange={(checked) => updatePreference("weekly_reports", checked)}
                    disabled={saving}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Configuração da API OpenAI</CardTitle>
            </div>
            <CardDescription>
              Configure seu token pessoal da OpenAI para usar a análise com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Para usar a análise com IA, você precisa configurar seu próprio token da OpenAI. 
                Os custos serão debitados da sua conta OpenAI.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {preferences.has_openai_key ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Token Configurado</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Token Não Configurado</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {preferences.has_openai_key 
                      ? "A análise com IA está disponível" 
                      : "Configure um token para habilitar a análise"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="openai-token" className="flex flex-col space-y-1">
                  <span>Token da API OpenAI</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Cole seu token da OpenAI (começa com sk-...)
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="openai-token"
                    type="password"
                    placeholder="sk-proj-..."
                    value={openaiToken}
                    onChange={(e) => setOpenaiToken(e.target.value)}
                    disabled={saving}
                  />
                  <Button 
                    onClick={() => {
                      if (openaiToken.trim()) {
                        updateOpenAIToken(openaiToken.trim());
                        setOpenaiToken("");
                      }
                    }}
                    disabled={saving || !openaiToken.trim()}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
                {preferences.has_openai_key && (
                  <Button 
                    variant="outline" 
                    onClick={removeOpenAIToken}
                    disabled={saving}
                    className="w-full"
                  >
                    Remover Token
                  </Button>
                )}
              </div>

              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p className="font-medium">Como obter seu token:</p>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    <li>Acesse <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">platform.openai.com/api-keys</a></li>
                    <li>Faça login ou crie uma conta</li>
                    <li>Clique em "Create new secret key"</li>
                    <li>Copie o token gerado e cole acima</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Modelo usado:</span>
                    <span className="font-medium">gpt-4o-mini</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo estimado:</span>
                    <span className="font-medium">~$0.10 por análise</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Limite de análise:</span>
                    <span className="font-medium">500 respostas por análise</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacidade e Segurança</CardTitle>
            <CardDescription>
              Gerencie suas preferências de privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[300px]" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sharing" className="flex flex-col space-y-1">
                  <span>Compartilhamento de Dados</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Permitir compartilhamento de dados para melhorias
                  </span>
                </Label>
                <Switch
                  id="data-sharing"
                  checked={preferences.data_sharing}
                  onCheckedChange={(checked) => updatePreference("data_sharing", checked)}
                  disabled={saving}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
