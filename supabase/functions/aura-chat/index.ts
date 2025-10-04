import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch user's devices and recent alerts for context
    const { data: devices } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', user.id);

    const { data: recentAlerts } = await supabase
      .from('security_alerts')
      .select('*, devices!inner(*)')
      .eq('devices.user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('first_name, email')
      .eq('id', user.id)
      .single();

    const userName = profile?.first_name || 'there';

    // Build context for AI
    const contextInfo = {
      devices: devices || [],
      recentAlerts: recentAlerts || [],
      deviceCount: devices?.length || 0,
    };

    const systemPrompt = `You are Aura, an intelligent assistant for AuraShield smart home security system.

Your Role:
- You help users monitor and control their smart home security devices
- You provide calm, professional, friendly, and reassuring responses
- You prioritize security and never share sensitive information without verification
- You give short, actionable, and clear answers

Current User Context:
- User name: ${userName}
- Total devices: ${contextInfo.deviceCount}
- Devices: ${JSON.stringify(contextInfo.devices.map(d => ({ name: d.device_name, status: d.status, ip: d.ip_address })))}
- Recent alerts: ${contextInfo.recentAlerts.length}

You can help with:
- Checking device status (locks, cameras, sensors)
- Viewing recent alerts and security events
- Explaining device issues
- Providing security recommendations
- Summarizing security activity

Guidelines:
- Be concise and helpful
- If a device action is requested, explain that you've checked the status
- For sensitive actions, remind users about security best practices
- If you don't have enough information, ask clarifying questions
- Always maintain a reassuring tone about their home security

Current conversation context:
${messages.slice(-5).map((m: any) => `${m.role}: ${m.content}`).join('\n')}`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI Gateway with Gemini
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service requires payment. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in aura-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
