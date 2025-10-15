import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch user context
    const { data: devices } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', user.id);

    const { data: recentAlerts } = await supabase
      .from('security_alerts')
      .select('*, devices(*)')
      .eq('devices.user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(5);

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Build context for AI
    const systemPrompt = `You are Aura, an AI assistant for AuraShield smart home security system.
    
User Context:
- User ID: ${user.id}
- Email: ${user.email}
- Devices: ${devices?.length || 0}
- Recent Alerts: ${recentAlerts?.length || 0}

Device Information:
${devices?.map(d => `- ${d.device_name} (${d.ip_address}) - Status: ${d.status}`).join('\n') || 'No devices'}

Recent Security Alerts:
${recentAlerts?.map(a => `- ${a.alert_type}: ${a.description} (${a.severity})`).join('\n') || 'No recent alerts'}

You should help users with:
- Understanding their security alerts
- Managing their smart home devices
- Providing security recommendations
- Explaining network activity

Be helpful, concise, and security-focused.`;

    // Call Lovable AI Gateway
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.statusText}`);
    }

    // Stream the response back to the client
    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    console.error('Error in aura-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
