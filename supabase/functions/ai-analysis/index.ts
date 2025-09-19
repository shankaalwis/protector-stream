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

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    // Call Gemini API for AI analysis
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini API response:', geminiData);

    // Extract the AI response from Gemini's response format
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate analysis at this time.';

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