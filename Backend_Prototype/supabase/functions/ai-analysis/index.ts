import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callLovableAI(messages: any[], maxRetries = 3) {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.lovable.app/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          stream: false,
        }),
      });

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (response.status === 402) {
        throw new Error('Insufficient credits for AI analysis');
      }

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      console.log(`Attempt ${attempt + 1} failed, retrying...`);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alertId, userQuery } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch alert details
    const { data: alert, error: alertError } = await supabase
      .from('security_alerts')
      .select(`
        *,
        devices (
          device_name,
          ip_address,
          mac_address,
          client_id,
          status
        )
      `)
      .eq('id', alertId)
      .single();

    if (alertError || !alert) {
      throw new Error('Alert not found');
    }

    if (!userQuery) {
      // Initial analysis mode
      const systemPrompt = `You are a cybersecurity expert analyzing a security alert. 
Provide a structured JSON analysis with the following fields:
- summary: Brief overview (2-3 sentences)
- threat_level: critical/high/medium/low
- recommended_actions: Array of 3-5 specific actions
- technical_details: Detailed technical analysis
- false_positive_likelihood: percentage (0-100)

Alert Details:
- Type: ${alert.alert_type}
- Description: ${alert.description}
- Severity: ${alert.severity}
- Device: ${alert.devices?.device_name} (${alert.devices?.ip_address})
- Client ID: ${alert.devices?.client_id}
- Current Status: ${alert.status}

Respond ONLY with valid JSON.`;

      const aiResponse = await callLovableAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Analyze this security alert and provide your assessment.' }
      ]);

      let analysis;
      try {
        analysis = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', aiResponse);
        analysis = {
          summary: aiResponse,
          threat_level: 'medium',
          recommended_actions: ['Review alert details', 'Monitor device activity'],
          technical_details: 'Analysis pending',
          false_positive_likelihood: 50
        };
      }

      // Update alert with analysis
      const { error: updateError } = await supabase
        .from('security_alerts')
        .update({
          ai_analysis_chat: [{
            role: 'assistant',
            content: JSON.stringify(analysis),
            timestamp: new Date().toISOString()
          }],
          status: 'resolved'
        })
        .eq('id', alertId);

      if (updateError) {
        throw new Error(`Failed to update alert: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Conversational mode
      const previousAnalysis = alert.ai_analysis_chat || [];
      
      const systemPrompt = `You are a cybersecurity expert helping a user understand a security alert.

Alert Context:
- Type: ${alert.alert_type}
- Description: ${alert.description}
- Severity: ${alert.severity}
- Device: ${alert.devices?.device_name}

Previous Analysis Summary:
${previousAnalysis.length > 0 ? previousAnalysis[0].content : 'No previous analysis'}

Provide a concise, helpful response to the user's question.`;

      const conversationHistory = previousAnalysis
        .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
        .slice(-5);

      const aiResponse = await callLovableAI([
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userQuery }
      ]);

      const updatedChat = [
        ...previousAnalysis,
        { role: 'user', content: userQuery, timestamp: new Date().toISOString() },
        { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
      ];

      await supabase
        .from('security_alerts')
        .update({ ai_analysis_chat: updatedChat })
        .eq('id', alertId);

      return new Response(
        JSON.stringify({ success: true, response: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in ai-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
