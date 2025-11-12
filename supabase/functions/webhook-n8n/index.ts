import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
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

    // Parse request body
    const body = await req.json();
    const { conversationId, ...otherData } = body;

    // Validate required fields
    if (!conversationId) {
      console.error('Missing required field: conversationId');
      return new Response(
        JSON.stringify({ error: 'conversationId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing webhook data:', { 
      conversationId, 
      dataKeys: Object.keys(otherData),
      timestamp: new Date().toISOString()
    });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert data (insert or update if conversation_id already exists)
    const { data, error } = await supabase
      .from('n8n_conversations')
      .upsert(
        {
          conversation_id: conversationId,
          data: otherData,
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
      timestamp: data.updated_at
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: data.id,
        conversation_id: data.conversation_id,
        message: 'Data received and stored successfully',
        timestamp: data.updated_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
