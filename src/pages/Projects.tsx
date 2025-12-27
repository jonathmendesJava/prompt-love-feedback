import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Eye, Copy, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "@/hooks/useProjects";

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: projects, isLoading, deleteProject, refetch } = useProjects();
  
  // Forçar refresh quando vindo da criação de projeto
  useEffect(() => {
    if (searchParams.get('refresh') === 'true') {
      refetch();
      // Remover o parâmetro da URL
      setSearchParams({});
    }
  }, [searchParams, refetch, setSearchParams]);

  const copyLink = (linkUnique: string) => {
    const url = `${window.location.origin}/form/${linkUnique}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const copyProjectId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID do projeto copiado!");
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
    deleteProject(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projetos Criados</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus projetos de avaliação
            </p>
          </div>
          <Button onClick={() => navigate("/create-project")}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-10" />
                    <Skeleton className="h-8 w-10" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects && projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhum projeto criado ainda
              </p>
              <Button onClick={() => navigate("/create-project")}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Projeto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects && projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant="secondary">
                      {project.response_count} respostas
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(project.link_unique)}
                      title="Copiar link do formulário"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">ID:</span>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[180px]" title={project.id}>
                      {project.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyProjectId(project.id)}
                      title="Copiar ID do projeto"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Criado em {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
