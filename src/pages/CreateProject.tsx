import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  const isSubmittingRef = useRef(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [publicTitle, setPublicTitle] = useState("");
  const [publicDescription, setPublicDescription] = useState("");
  const [clientBrandName, setClientBrandName] = useState("");
  const [clientLogoUrl, setClientLogoUrl] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question_text: "", question_type: "text", order_index: 0, scale_config: {} },
  ]);

  const addQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: "",
      question_type: "text",
      order_index: questions.length,
      scale_config: {},
    };
    setQuestions([...questions, newQuestion]);
  }, [questions]);

  const removeQuestion = useCallback((id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  }, [questions]);

  const updateQuestion = useCallback((id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  }, [questions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir submissão dupla
    if (isSubmittingRef.current) {
      console.log("Submissão já em andamento, ignorando...");
      return;
    }

    // Validação antes de submeter
    if (!projectName.trim()) {
      toast.error("Por favor, preencha o nome do projeto");
      return;
    }

    if (questions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta ao projeto");
      return;
    }

    const hasEmptyQuestions = questions.some(q => !q.question_text.trim());
    if (hasEmptyQuestions) {
      toast.error("Todas as perguntas devem ter um texto preenchido");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      console.log("Criando projeto:", projectName);

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: projectName,
          description: projectDescription,
          public_title: publicTitle || null,
          public_description: publicDescription || null,
          client_brand_name: clientBrandName || null,
          client_logo_url: clientLogoUrl || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) {
        console.error("Erro ao criar projeto:", projectError);
        throw projectError;
      }

      console.log("Projeto criado com ID:", project.id);

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

      if (questionsError) {
        console.error("Erro ao criar perguntas:", questionsError);
        throw questionsError;
      }

      console.log("Perguntas criadas com sucesso");
      
      toast.success("Projeto criado com sucesso!");
      
      // Aguardar um pouco antes de navegar com flag para forçar refresh
      setTimeout(() => {
        navigate("/projects?refresh=true", { replace: true });
      }, 500);
    } catch (error: any) {
      console.error("Erro completo:", error);
      toast.error(error.message || "Erro ao criar projeto. Tente novamente.");
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Novo Projeto</h1>
          <p className="text-muted-foreground mt-2">
            Configure seu formulário de avaliação personalizado. Adicione perguntas, personalize a aparência e compartilhe com seus clientes.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {loading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <Card className="w-auto">
                <CardContent className="pt-6 pb-6 px-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-lg font-medium">Salvando projeto...</p>
                    <p className="text-sm text-muted-foreground">Por favor, aguarde</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Identificação interna do projeto. Essas informações são visíveis apenas para você no painel administrativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Avaliação de Atendimento - Suporte Q1 2025"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use um nome descritivo para identificar facilmente este projeto no seu painel
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição Interna (Opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Ex: Formulário para avaliar a qualidade do atendimento do suporte técnico após cada chamado..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Notas ou contexto sobre este projeto, visível apenas para você
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Formulário de Avaliação</CardTitle>
              <CardDescription>
                Configure a aparência pública do formulário e adicione as perguntas que seus clientes responderão
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Public Form Text Section */}
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">🎨 Personalização Visual</h3>
                  <p className="text-xs text-muted-foreground">
                    Personalize como o formulário será exibido para seus clientes quando acessarem o link público
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientBrandName">Nome da Marca (Opcional)</Label>
                  <Input
                    id="clientBrandName"
                    placeholder="Ex: Tech Solutions LTDA"
                    value={clientBrandName}
                    onChange={(e) => setClientBrandName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparecerá no topo do formulário junto com a logo. Deixe vazio para não exibir.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientLogoUrl">URL da Logo (Opcional)</Label>
                  <Input
                    id="clientLogoUrl"
                    type="url"
                    placeholder="https://seusite.com/logo.png"
                    value={clientLogoUrl}
                    onChange={(e) => setClientLogoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Logo exibida no cabeçalho do formulário. Dica: use PNG/SVG com fundo transparente
                  </p>
                  {clientLogoUrl && (
                    <div className="mt-2 p-4 border rounded-lg bg-background/50">
                      <p className="text-xs font-medium mb-2">✓ Preview da Logo:</p>
                      <img 
                        src={clientLogoUrl} 
                        alt="Preview" 
                        className="h-12 w-auto mx-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="publicTitle">Título do Formulário (Opcional)</Label>
                  <Input
                    id="publicTitle"
                    placeholder="Ex: Como foi sua experiência com nosso atendimento?"
                    value={publicTitle}
                    onChange={(e) => setPublicTitle(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Título principal que aparece no formulário público. Se vazio, usa o nome do projeto.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicDescription">Mensagem de Boas-Vindas (Opcional)</Label>
                  <Textarea
                    id="publicDescription"
                    placeholder="Ex: Sua opinião é muito importante! Responda às perguntas abaixo para nos ajudar a melhorar nossos serviços."
                    value={publicDescription}
                    onChange={(e) => setPublicDescription(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Texto de introdução exibido antes das perguntas. Se vazio, usa a descrição do projeto.
                  </p>
                </div>
              </div>

              {/* Questions Section */}
              <Separator className="my-6" />
              
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-semibold">📝 Perguntas do Formulário</h3>
                <p className="text-xs text-muted-foreground">
                  Adicione quantas perguntas precisar. Use diferentes tipos para coletar avaliações, escolhas ou comentários dos seus clientes.
                </p>
              </div>

              {questions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma pergunta adicionada ainda. Clique no botão "Adicionar Pergunta" abaixo para começar.
                </p>
              )}

              {questions.map((question, index) => (
                <div key={`${question.id}-${question.question_type}`} className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Coluna Esquerda - Configuração */}
                  <div className="space-y-4">
                    <Card className="border-2">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">Pergunta {index + 1}</CardTitle>
                            <CardDescription>Defina o texto e o tipo de resposta esperada</CardDescription>
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
                            placeholder="Ex: Como você avalia a qualidade do nosso atendimento?"
                            value={question.question_text}
                            onChange={(e) =>
                              updateQuestion(question.id, "question_text", e.target.value)
                            }
                            required
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Seja claro e objetivo. Esta é a pergunta que seu cliente verá no formulário.
                          </p>
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
                              <SelectItem value="text">📝 Texto Aberto - Resposta livre do cliente</SelectItem>
                              <SelectItem value="nps">📊 NPS (0-10) - Net Promoter Score padrão</SelectItem>
                              <SelectItem value="csat">😊 CSAT - Customer Satisfaction (Muito Insatisfeito a Muito Satisfeito)</SelectItem>
                              <SelectItem value="ces">⚡ CES - Customer Effort Score (esforço necessário)</SelectItem>
                              <SelectItem value="stars">⭐ Estrelas - Avaliação de 1 a 5 estrelas</SelectItem>
                              <SelectItem value="emojis">😄 Emojis - Avaliação visual com emojis</SelectItem>
                              <SelectItem value="hearts">❤️ Corações - Avaliação com corações</SelectItem>
                              <SelectItem value="single_choice">◉ Escolha Única - Cliente escolhe apenas uma opção</SelectItem>
                              <SelectItem value="multiple_choice">☑ Múltipla Escolha - Cliente pode escolher várias opções</SelectItem>
                              <SelectItem value="like_dislike">👍 Like/Dislike - Gostou ou não gostou</SelectItem>
                              <SelectItem value="likert">📏 Escala Likert - Concordo totalmente a Discordo totalmente</SelectItem>
                              <SelectItem value="matrix">⊞ Matriz - Múltiplos itens com mesma escala de avaliação</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Escolha o formato que melhor se adapta ao tipo de feedback que você quer coletar
                          </p>
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
                        <CardTitle className="text-lg">👁️ Pré-visualização em Tempo Real</CardTitle>
                        <CardDescription>Veja exatamente como esta pergunta aparecerá para seus clientes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <QuestionPreview 
                          question={question} 
                          index={index}
                          showFormHeader={index === 0}
                          publicTitle={publicTitle}
                          publicDescription={publicDescription}
                          projectName={projectName}
                          projectDescription={projectDescription}
                          clientBrandName={clientBrandName}
                          clientLogoUrl={clientLogoUrl}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
                {index < questions.length - 1 && <Separator className="my-6" />}
              </div>
              ))}
            </CardContent>

            <CardFooter>
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </CardFooter>
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
