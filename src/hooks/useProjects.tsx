import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  link_unique: string;
  created_at: string;
  response_count?: number;
}

export function useProjects() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Get response counts in a single query using aggregation
      const { data: responseCounts, error: countsError } = await supabase
        .from("responses")
        .select("project_id, session_id");

      if (countsError) throw countsError;

      // Count unique sessions per project
      const countsByProject = (responseCounts || []).reduce((acc, response) => {
        if (!acc[response.project_id]) {
          acc[response.project_id] = new Set();
        }
        acc[response.project_id].add(response.session_id);
        return acc;
      }, {} as Record<string, Set<string>>);

      return (projectsData || []).map(project => ({
        ...project,
        response_count: countsByProject[project.id]?.size || 0
      }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-cards"] });
      toast.success("Projeto excluído");
    },
    onError: () => {
      toast.error("Erro ao excluir projeto");
    },
  });

  return {
    ...query,
    deleteProject: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
