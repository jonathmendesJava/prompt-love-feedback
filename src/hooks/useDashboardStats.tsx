import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalProjects: number;
  totalResponses: number;
  averageRating: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: projects } = await supabase
        .from("projects")
        .select("id", { count: "exact" });

      const { data: responses } = await supabase
        .from("responses")
        .select("session_id, response_value");

      const totalProjects = projects?.length || 0;
      
      const uniqueSessions = new Set(responses?.map(r => r.session_id) || []).size;
      const totalResponses = uniqueSessions;
      
      const ratings = responses?.filter(r => r.response_value).map(r => r.response_value) || [];
      const averageRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

      return { totalProjects, totalResponses, averageRating };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
