import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-project-id',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook received:', req.method, req.url);

    // Validate webhook secret
    const webhookSecret = req.headers.get('X-Webhook-Secret');
    const expectedSecret = Deno.env.get('N8N_WEBHOOK_SECRET');
    
    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.error('Unauthorized webhook call attempt - invalid or missing secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate project ID header
    const projectId = req.headers.get('X-Project-Id');
    if (!projectId) {
      console.error('Missing required header: X-Project-Id');
      return new Response(
        JSON.stringify({ error: 'X-Project-Id header is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { conversationId, accountId, ...otherData } = body;

    // Validate required fields
    if (!conversationId) {
      console.error('Missing required field: conversationId');
      return new Response(
        JSON.stringify({ error: 'conversationId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!accountId) {
      console.error('Missing required field: accountId');
      return new Response(
        JSON.stringify({ error: 'accountId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing webhook data:', { 
      projectId,
      conversationId,
      accountId,
      dataKeys: Object.keys(otherData),
      timestamp: new Date().toISOString()
    });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('link_unique, user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Project not found:', projectError);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct links
    const baseUrl = supabaseUrl.replace('.supabase.co', '.lovable.app');
    const formLink = `${baseUrl}/form/${project.link_unique}?conversationId=${conversationId}&accountId=${accountId}`;
    const chatwootLink = `https://app.chatwoot.com/app/accounts/${accountId}/conversations/${conversationId}`;

    console.log('Generated links:', { formLink, chatwootLink });

    // Upsert data (insert or update if conversation_id already exists)
    const { data, error } = await supabase
      .from('n8n_conversations')
      .upsert(
        {
          conversation_id: conversationId,
          user_id: project.user_id,
          data: {
            ...otherData,
            accountId,
            projectId,
            formLink,
            chatwootLink
          },
          updated_at: new Date().toISOString()
        },
        { onConflict: 'conversation_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully saved conversation:', {
      id: data.id,
      conversation_id: data.conversation_id,
      project_id: projectId,
      timestamp: data.updated_at
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: data.id,
        conversation_id: data.conversation_id,
        account_id: accountId,
        project_id: projectId,
        formLink,
        chatwootLink,
        message: 'Data received and stored successfully',
        timestamp: data.updated_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
