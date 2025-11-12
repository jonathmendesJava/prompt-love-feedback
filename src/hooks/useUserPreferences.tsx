import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserPreferences {
  id?: string;
  user_id?: string;
  email_notifications: boolean;
  weekly_reports: boolean;
  data_sharing: boolean;
  has_openai_key?: boolean;
}

export type { UserPreferences };

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    weekly_reports: true,
    data_sharing: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          ...data,
          has_openai_key: !!data.openai_api_key,
        });
      } else {
        // Create default preferences if they don't exist
        const { data: newPrefs, error: insertError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            email_notifications: true,
            weekly_reports: true,
            data_sharing: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newPrefs) setPreferences(newPrefs);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Erro ao carregar preferências");
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: boolean) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("user_preferences")
        .update({ [key]: value })
        .eq("user_id", user.id);

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, [key]: value }));
      toast.success("Preferência atualizada");
    } catch (error) {
      console.error("Error updating preference:", error);
      toast.error("Erro ao atualizar preferência");
      // Revert on error
      await loadPreferences();
    } finally {
      setSaving(false);
    }
  };

  const updateOpenAIToken = async (token: string) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("user_preferences")
        .update({ openai_api_key: token })
        .eq("user_id", user.id);

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, has_openai_key: true }));
      toast.success("Token OpenAI salvo com sucesso!");
    } catch (error) {
      console.error("Error updating OpenAI token:", error);
      toast.error("Erro ao salvar token OpenAI");
    } finally {
      setSaving(false);
    }
  };

  const removeOpenAIToken = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("user_preferences")
        .update({ openai_api_key: null })
        .eq("user_id", user.id);

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, has_openai_key: false }));
      toast.success("Token OpenAI removido com sucesso!");
    } catch (error) {
      console.error("Error removing OpenAI token:", error);
      toast.error("Erro ao remover token OpenAI");
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreference,
    updateOpenAIToken,
    removeOpenAIToken,
  };
}
