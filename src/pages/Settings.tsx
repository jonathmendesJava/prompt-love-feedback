import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Shield, User } from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { preferences, loading, saving, updatePreference } = useUserPreferences();

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
