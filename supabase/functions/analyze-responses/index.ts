import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get optional project filter from request body
    let projectId: string | null = null;
    try {
      const body = await req.json();
      projectId = body.projectId || null;
      console.log('Project filter:', projectId || 'all projects');
    } catch {
      console.log('No request body, analyzing all projects');
    }

    console.log('Fetching user preferences and responses for user:', user.id);

    // Fetch user's OpenAI API key
    const { data: preferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .maybeSingle();

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError);
      throw new Error('Erro ao buscar preferências do usuário');
    }

    if (!preferences?.openai_api_key) {
      return new Response(
        JSON.stringify({ 
          error: 'Token OpenAI não configurado. Configure seu token nas Configurações.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = preferences.openai_api_key;
    console.log('OpenAI token configured, fetching responses...');

    // Fetch responses from user's projects with optional project filter
    let query = supabase
      .from('responses')
      .select(`
        id,
        response_text,
        response_value,
        response_data,
        submitted_at,
        session_id,
        projects!inner(user_id, name),
        questions(question_text, question_type)
      `)
      .eq('projects.user_id', user.id);
    
    // Add project filter if specified
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data: responses, error: responsesError } = await query
      .order('submitted_at', { ascending: false })
      .limit(500);

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      throw new Error(`Database error: ${responsesError.message}`);
    }

    console.log(`Found ${responses?.length || 0} responses`);

    if (!responses || responses.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No responses found',
          analysis: {
            summary: 'Nenhuma resposta encontrada para análise.',
            recommendations: [],
            negativeIssues: [],
            positiveHighlights: [],
            metrics: {
              totalResponses: 0,
              averageRating: 0,
              negativeCount: 0,
              positiveCount: 0
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for AI analysis
    const responsesText = responses.map((r: any) => {
      const projectName = r.projects?.name || 'Unknown';
      const questionText = r.questions?.question_text || 'Question';
      const responseValue = r.response_text || r.response_value || JSON.stringify(r.response_data);
      return `Projeto: ${projectName}\nPergunta: ${questionText}\nResposta: ${responseValue}\n---`;
    }).join('\n');

    console.log('Calling OpenAI for analysis...');

    // Call OpenAI API for analysis
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um analista de feedback de clientes especializado. Analise os feedbacks fornecidos e retorne APENAS um JSON válido com a seguinte estrutura:
{
  "summary": "Resumo geral dos feedbacks em português (3-5 frases)",
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"],
  "negativeIssues": ["problema 1", "problema 2", "problema 3"],
  "positiveHighlights": ["ponto positivo 1", "ponto positivo 2"],
  "metrics": {
    "totalResponses": número_total_de_respostas,
    "averageRating": número_de_0_a_10,
    "negativeCount": número_de_feedbacks_negativos,
    "positiveCount": número_de_feedbacks_positivos
  }
}

INSTRUÇÕES PARA CÁLCULO DE MÉTRICAS:
1. totalResponses: Conte o número total de feedbacks analisados
2. averageRating (escala 0-10): 
   - Se houver perguntas NPS, CSAT ou escalas numéricas: use a média real dos valores
   - Para respostas textuais: analise o sentimento e atribua uma nota:
     * Muito positivo: 8-10
     * Positivo: 6-7.5
     * Neutro: 5-6
     * Negativo: 2-4.5
     * Muito negativo: 0-2
   - Calcule a média final de TODAS as respostas
3. negativeCount: Conte feedbacks com sentimento negativo (críticas, reclamações, insatisfação)
4. positiveCount: Conte feedbacks com sentimento positivo (elogios, satisfação, recomendações)

IMPORTANTE: 
- Retorne APENAS o JSON válido, sem markdown ou texto adicional
- A avaliação média DEVE ser um número decimal entre 0 e 10
- As contagens devem somar corretamente em relação ao total`
          },
          {
            role: 'user',
            content: `Analise os seguintes feedbacks de clientes:\n\n${responsesText}\n\nTotal de respostas recebidas: ${responses.length}\n\nPor favor, analise cuidadosamente cada resposta, identifique o tipo de pergunta (NPS, CSAT, texto livre, escala), calcule as métricas solicitadas e forneça insights acionáveis.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Token OpenAI inválido. Verifique seu token nas Configurações.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de taxa da OpenAI excedido. Tente novamente mais tarde.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402 || aiResponse.status === 403) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes na sua conta OpenAI. Adicione créditos em platform.openai.com.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`OpenAI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid AI response structure:', JSON.stringify(aiData));
      throw new Error('Invalid AI response structure');
    }
    
    let analysisText = aiData.choices[0].message.content;
    console.log('Raw AI content:', analysisText.substring(0, 200));
    
    // Remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
      console.log('Successfully parsed AI response');
      
      // Validate structure
      if (!analysis.metrics) {
        console.warn('Missing metrics in AI response, adding defaults');
        analysis.metrics = {
          totalResponses: responses.length,
          averageRating: 0,
          negativeCount: 0,
          positiveCount: 0
        };
      }
      
      // Ensure arrays exist
      analysis.recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
      analysis.negativeIssues = Array.isArray(analysis.negativeIssues) ? analysis.negativeIssues : [];
      analysis.positiveHighlights = Array.isArray(analysis.positiveHighlights) ? analysis.positiveHighlights : [];
      
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON. Raw text:', analysisText);
      console.error('Parse error:', parseError);
      // Fallback structure
      analysis = {
        summary: analysisText.substring(0, 500) || 'Não foi possível processar a análise',
        recommendations: ['Análise parcial: não foi possível extrair recomendações estruturadas'],
        negativeIssues: [],
        positiveHighlights: [],
        metrics: {
          totalResponses: responses.length,
          averageRating: 0,
          negativeCount: 0,
          positiveCount: 0
        }
      };
    }

    console.log('Analysis complete with', analysis.recommendations.length, 'recommendations');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-responses function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
