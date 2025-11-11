import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  question_type: "text" | "multiple_choice" | "stars";
  options?: string[];
  max_stars?: number;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question_text: "", question_type: "text" },
  ]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: "",
      question_type: "text",
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: projectName,
          description: projectDescription,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const questionsToInsert = questions.map((q, index) => ({
        project_id: project.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        max_stars: q.question_type === "stars" ? (q.max_stars || 5) : null,
        order_index: index,
      }));

      const { error: questionsError } = await supabase
        .from("questions")
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast.success("Projeto criado com sucesso!");
      navigate("/projects");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar projeto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Projeto CTA</h1>
          <p className="text-muted-foreground mt-2">
            Configure um novo formulário de avaliação
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
              <CardDescription>
                Defina o nome e descrição do seu projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto *</Label>
                <Input
                  id="name"
                  placeholder="Ex: CTA - Suporte Técnico"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Breve descrição do projeto..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Perguntas</CardTitle>
              <CardDescription>
                Configure as perguntas do seu formulário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <Label>Pergunta {index + 1}</Label>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <Input
                      placeholder="Digite a pergunta..."
                      value={question.question_text}
                      onChange={(e) =>
                        updateQuestion(question.id, "question_text", e.target.value)
                      }
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Resposta</Label>
                        <Select
                          value={question.question_type}
                          onValueChange={(value) =>
                            updateQuestion(question.id, "question_type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto Aberto</SelectItem>
                            <SelectItem value="stars">Estrelas</SelectItem>
                            <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {question.question_type === "stars" && (
                        <div className="space-y-2">
                          <Label>Número de Estrelas</Label>
                          <Select
                            value={question.max_stars?.toString() || "5"}
                            onValueChange={(value) =>
                              updateQuestion(question.id, "max_stars", parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[3, 4, 5, 10].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} estrelas
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/projects")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Projeto"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
