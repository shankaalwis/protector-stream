import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alertId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get alert details
    const { data: alert, error: alertError } = await supabase
      .from('security_alerts')
      .select('*')
      .eq('id', alertId)
      .single();

    if (alertError) {
      throw new Error(`Failed to fetch alert: ${alertError.message}`);
    }

    // Prepare AI prompt
    const prompt = `Analyze this security alert and provide mitigation strategies:

Alert Type: ${alert.alert_type}
Description: ${alert.description}  
Severity: ${alert.severity}
Timestamp: ${alert.timestamp}

Please provide:
1. Risk assessment
2. Potential causes
3. Recommended mitigation strategies
4. Prevention measures`;

    // Mock AI response for now - replace with actual AI service call
    const aiResponse = `Based on the ${alert.severity} severity ${alert.alert_type} alert, here's my analysis:

1. Risk Assessment: This alert indicates a potential security breach that requires immediate attention.

2. Potential Causes:
   - Unauthorized access attempt
   - Malware or suspicious software activity
   - Network intrusion or reconnaissance

3. Recommended Mitigation Strategies:
   - Immediately isolate the affected device
   - Review and update firewall rules
   - Conduct a full system scan
   - Monitor network traffic for unusual patterns

4. Prevention Measures:
   - Implement multi-factor authentication
   - Keep systems and software updated
   - Regular security audits and penetration testing
   - Employee security training`;

    // Update alert with AI analysis
    const aiAnalysisChat = [
      ...(alert.ai_analysis_chat || []),
      {
        role: 'user',
        content: prompt
      },
      {
        role: 'ai',
        content: aiResponse
      }
    ];

    const { error: updateError } = await supabase
      .from('security_alerts')
      .update({ 
        ai_analysis_chat: aiAnalysisChat,
        status: 'resolved'
      })
      .eq('id', alertId);

    if (updateError) {
      throw new Error(`Failed to update alert: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: aiResponse 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});