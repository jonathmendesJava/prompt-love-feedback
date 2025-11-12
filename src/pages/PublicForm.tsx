import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import fiosLogo from "@/assets/fios-logo-public.png";
import { Question as QuestionType, ScaleConfig } from "@/types/questions";
import NPSInput from "@/components/form-inputs/NPSInput";
import CSATInput from "@/components/form-inputs/CSATInput";
import CESInput from "@/components/form-inputs/CESInput";
import EmojiInput from "@/components/form-inputs/EmojiInput";
import HeartInput from "@/components/form-inputs/HeartInput";
import LikeDislikeInput from "@/components/form-inputs/LikeDislikeInput";
import SingleChoiceInput from "@/components/form-inputs/SingleChoiceInput";
import MultipleChoiceInput from "@/components/form-inputs/MultipleChoiceInput";
import LikertInput from "@/components/form-inputs/LikertInput";
import MatrixInput from "@/components/form-inputs/MatrixInput";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  scale_config: ScaleConfig;
}

export default function PublicForm() {
  const { linkUnique } = useParams();
  const [project, setProject] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadForm();
  }, [linkUnique]);

  const loadForm = async () => {
    try {
      // Fetch project data including public form text and client branding
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id, name, description, public_title, public_description, client_brand_name, client_logo_url")
        .eq("link_unique", linkUnique)
        .single();

      if (projectError) throw projectError;
      if (!projectData) {
        console.error("Project not found");
        return;
      }

      setProject(projectData);

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("project_id", projectData.id)
        .order("order_index");

      if (questionsError) throw questionsError;
      setQuestions(questionsData.map(q => ({
        ...q,
        scale_config: q.scale_config as any as ScaleConfig
      })) || []);
    } catch (error) {
      toast.error("Formulário não encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const responses = questions.map((question) => {
        const answer = answers[question.id];
        let responseData: any = {
          project_id: project.id,
          question_id: question.id,
          session_id: sessionId,
          response_text: null,
          response_value: null,
          response_data: null,
        };

        switch (question.question_type) {
          case "text":
            responseData.response_text = answer;
            break;
          case "nps":
          case "csat":
          case "ces":
          case "stars":
          case "emojis":
          case "hearts":
          case "likert":
            responseData.response_value = answer;
            break;
          case "like_dislike":
            responseData.response_value = answer;
            break;
          case "single_choice":
            responseData.response_value = answer?.index;
            responseData.response_text = answer?.text;
            break;
          case "multiple_choice":
            responseData.response_data = answer;
            break;
          case "matrix":
            responseData.response_data = answer;
            break;
        }

        return responseData;
      });

      const { error } = await supabase.from("responses").insert(responses);

      if (error) throw error;

      setSubmitted(true);
      toast.success("Obrigado pelo seu feedback!");
    } catch (error: any) {
      toast.error("Erro ao enviar respostas");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">✓ Enviado com sucesso!</CardTitle>
            <CardDescription>Obrigado pelo seu feedback.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl relative">
          {/* Marca d'água Fios DizAí - Superior Esquerdo */}
          <div className="absolute top-4 left-4 flex items-center gap-2 opacity-60 z-10">
            <img src={fiosLogo} alt="FiOS" className="h-6 w-auto" />
            <span className="text-xs font-medium text-muted-foreground">Fios DizAí</span>
          </div>

          <CardHeader className="text-center pt-12">
            {/* Logo e Nome do Cliente - Centro */}
            {((project as any)?.client_logo_url || (project as any)?.client_brand_name) && (
              <div className="flex flex-col items-center gap-3 mb-6">
                {(project as any)?.client_logo_url && (
                  <img 
                    src={(project as any).client_logo_url} 
                    alt="Logo" 
                    className="h-16 w-auto max-w-xs object-contain"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                )}
                {(project as any)?.client_brand_name && (
                  <CardTitle className="text-3xl text-primary">
                    {(project as any).client_brand_name}
                  </CardTitle>
                )}
              </div>
            )}

            {/* Título e Descrição */}
            <CardTitle className="text-2xl mt-2">
              {(project as any)?.public_title || project?.name}
            </CardTitle>
            {((project as any)?.public_description || project?.description) && (
              <CardDescription className="text-base mt-2">
                {(project as any)?.public_description || project?.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base font-semibold">
                    {index + 1}. {question.question_text}
                  </Label>

                  {question.question_type === "text" && (
                    <Textarea
                      value={answers[question.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [question.id]: e.target.value })
                      }
                      placeholder="Digite sua resposta..."
                      required
                      rows={4}
                    />
                  )}

                  {question.question_type === "stars" && (
                    <div className="flex gap-2">
                      {Array.from({ length: question.scale_config?.maxValue || 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setAnswers({ ...answers, [question.id]: i + 1 })
                          }
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              answers[question.id] > i
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {question.question_type === "nps" && (
                    <NPSInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}

                  {question.question_type === "csat" && (
                    <CSATInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}

                  {question.question_type === "ces" && (
                    <CESInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}

                  {question.question_type === "emojis" && (
                    <EmojiInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}

                  {question.question_type === "hearts" && (
                    <HeartInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}

                  {question.question_type === "like_dislike" && (
                    <LikeDislikeInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}

                  {question.question_type === "single_choice" && (
                    <SingleChoiceInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}

                  {question.question_type === "multiple_choice" && (
                    <MultipleChoiceInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}

                  {question.question_type === "likert" && (
                    <LikertInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}

                  {question.question_type === "matrix" && (
                    <MatrixInput
                      question={question as any}
                      value={answers[question.id] || null}
                      onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    />
                  )}
                </div>
              ))}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
