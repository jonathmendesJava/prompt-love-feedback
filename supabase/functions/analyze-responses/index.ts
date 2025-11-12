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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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

    console.log('Fetching responses for user:', user.id);

    // Fetch all responses from user's projects
    const { data: responses, error: responsesError } = await supabase
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
      .eq('projects.user_id', user.id)
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

    console.log('Calling Lovable AI for analysis...');

    // Call Lovable AI for analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um analista de feedback de clientes especializado. Analise os feedbacks fornecidos e retorne APENAS um JSON válido com a seguinte estrutura:
{
  "summary": "Resumo geral dos feedbacks em português",
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"],
  "negativeIssues": ["problema 1", "problema 2", "problema 3"],
  "positiveHighlights": ["ponto positivo 1", "ponto positivo 2"],
  "metrics": {
    "totalResponses": número,
    "averageRating": número,
    "negativeCount": número,
    "positiveCount": número
  }
}

IMPORTANTE: Retorne APENAS o JSON, sem markdown ou texto adicional.`
          },
          {
            role: 'user',
            content: `Analise os seguintes feedbacks de clientes:\n\n${responsesText}\n\nTotal de respostas: ${responses.length}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de taxa excedido. Tente novamente mais tarde.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos ao seu workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
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
