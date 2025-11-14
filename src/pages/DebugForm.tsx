import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function DebugForm() {
  const { linkUnique } = useParams();
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    const test = async () => {
      const result = {
        linkUnique,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      };

      try {
        console.log('🔍 [Debug] Testando acesso ao projeto...');
        
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("link_unique", linkUnique)
          .single();

        console.log('📊 [Debug] Resultado:', { data, error });

        setDebug({
          ...result,
          success: !error,
          data,
          error: error ? {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          } : null,
        });
      } catch (e: any) {
        console.error('💥 [Debug] Erro:', e);
        setDebug({
          ...result,
          success: false,
          error: e.message,
        });
      }
    };

    test();
  }, [linkUnique]);

  return (
    <div className="min-h-screen p-8 bg-black text-green-400 font-mono text-sm">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl mb-6 font-bold">🔍 Debug Formulário FiOS DizAí</h1>
        
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded ${debug.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {debug.success ? '✅ SUCESSO' : '❌ ERRO'}
          </span>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>

        <div className="mt-6 text-gray-400 text-xs">
          <p>💡 Este é um endpoint de diagnóstico.</p>
          <p>Se você está vendo um erro, entre em contato com o suporte e compartilhe esta tela.</p>
        </div>
      </div>
    </div>
  );
}
