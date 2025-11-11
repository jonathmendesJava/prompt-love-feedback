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
import { Question as QuestionType, ScaleConfig, QuestionType as QType } from "@/types/questions";
import QuestionPreview from "@/components/QuestionPreview";
import NPSConfig from "@/components/question-config/NPSConfig";
import CSATConfig from "@/components/question-config/CSATConfig";
import CESConfig from "@/components/question-config/CESConfig";
import StarsConfig from "@/components/question-config/StarsConfig";
import EmojiConfig from "@/components/question-config/EmojiConfig";
import HeartConfig from "@/components/question-config/HeartConfig";
import LikeDislikeConfig from "@/components/question-config/LikeDislikeConfig";
import ChoiceConfig from "@/components/question-config/ChoiceConfig";
import LikertConfig from "@/components/question-config/LikertConfig";
import MatrixConfig from "@/components/question-config/MatrixConfig";

interface Question {
  id: string;
  question_text: string;
  question_type: QType;
  order_index: number;
  scale_config?: ScaleConfig;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question_text: "", question_type: "text", order_index: 0, scale_config: {} },
  ]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: "",
      question_type: "text",
      order_index: questions.length,
      scale_config: {},
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
        scale_config: (q.scale_config || null) as any,
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
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="grid lg:grid-cols-2 gap-6">
                  {/* Coluna Esquerda - Configuração */}
                  <div className="space-y-4">
                    <Card className="border-2">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">Pergunta {index + 1}</CardTitle>
                            <CardDescription>Configure os detalhes da pergunta</CardDescription>
                          </div>
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
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`question-${question.id}`}>Texto da Pergunta *</Label>
                          <Textarea
                            id={`question-${question.id}`}
                            placeholder="Digite a pergunta..."
                            value={question.question_text}
                            onChange={(e) =>
                              updateQuestion(question.id, "question_text", e.target.value)
                            }
                            required
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`type-${question.id}`}>Tipo de Resposta *</Label>
                          <Select
                            value={question.question_type}
                            onValueChange={(value) =>
                              updateQuestion(question.id, "question_type", value)
                            }
                          >
                            <SelectTrigger id={`type-${question.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">📝 Texto Aberto</SelectItem>
                              <SelectItem value="nps">📊 NPS (0-10)</SelectItem>
                              <SelectItem value="csat">😊 CSAT (Satisfação)</SelectItem>
                              <SelectItem value="ces">⚡ CES (Esforço)</SelectItem>
                              <SelectItem value="stars">⭐ Estrelas</SelectItem>
                              <SelectItem value="emojis">😄 Emojis</SelectItem>
                              <SelectItem value="hearts">❤️ Corações</SelectItem>
                              <SelectItem value="single_choice">◉ Escolha Única</SelectItem>
                              <SelectItem value="multiple_choice">☑ Múltipla Escolha</SelectItem>
                              <SelectItem value="like_dislike">👍 Like/Dislike</SelectItem>
                              <SelectItem value="likert">📏 Escala Likert</SelectItem>
                              <SelectItem value="matrix">⊞ Matriz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Configurações específicas por tipo */}
                        {question.question_type === "nps" && (
                          <NPSConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                          />
                        )}
                        {question.question_type === "csat" && (
                          <CSATConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                          />
                        )}
                        {question.question_type === "ces" && (
                          <CESConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                          />
                        )}
                        {question.question_type === "stars" && (
                          <StarsConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                          />
                        )}
                        {question.question_type === "emojis" && (
                          <EmojiConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                          />
                        )}
                        {question.question_type === "hearts" && (
                          <HeartConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                          />
                        )}
                        {question.question_type === "like_dislike" && (
                          <LikeDislikeConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                          />
                        )}
                        {question.question_type === "single_choice" && (
                          <ChoiceConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                            isMultiple={false}
                          />
                        )}
                        {question.question_type === "multiple_choice" && (
                          <ChoiceConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                            isMultiple={true}
                          />
                        )}
                        {question.question_type === "likert" && (
                          <LikertConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                          />
                        )}
                        {question.question_type === "matrix" && (
                          <MatrixConfig
                            config={question.scale_config || {}}
                            onChange={(config) => updateQuestion(question.id, "scale_config", config)}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Coluna Direita - Preview */}
                  <div className="lg:sticky lg:top-6 lg:self-start">
                    <Card className="bg-muted/30">
                      <CardHeader>
                        <CardTitle className="text-lg">👁️ Pré-visualização</CardTitle>
                        <CardDescription>Como a pergunta aparecerá no formulário</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <QuestionPreview question={question} index={index} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
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
