import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import fiosLogo from "@/assets/fios-logo-public.png";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  max_stars: number;
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
      // Use RPC function to get project data securely
      const { data: projectData, error: projectError } = await supabase
        .rpc("get_project_by_link", { link: linkUnique });

      if (projectError || !projectData || projectData.length === 0) {
        throw new Error("Project not found");
      }

      const project = projectData[0];
      setProject(project);

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("project_id", project.id)
        .order("order_index");

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
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

      const responses = questions.map((question) => ({
        project_id: project.id,
        question_id: question.id,
        response_text: question.question_type === "text" ? answers[question.id] : null,
        response_value: question.question_type === "stars" ? answers[question.id] : null,
        session_id: sessionId,
      }));

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
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={fiosLogo} alt="FiOS Logo" className="h-10 w-auto" />
              <CardTitle className="text-3xl text-primary">FiOS | CTA</CardTitle>
            </div>
            <CardTitle className="text-2xl mt-4">{project?.name}</CardTitle>
            {project?.description && (
              <CardDescription className="text-base mt-2">
                {project.description}
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
                      {Array.from({ length: question.max_stars || 5 }).map((_, i) => (
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
