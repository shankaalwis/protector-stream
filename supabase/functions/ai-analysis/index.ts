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

    // System prompt integrated into the user prompt for better JSON formatting
    const userPrompt = `You are a highly-specialized cybersecurity analyst. Analyze the following security alert and provide a concise security analysis.

CRITICAL: Respond ONLY with valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object.

Required JSON format:
{
  "summary": "Brief, non-technical explanation of the alert",
  "threat_level": "One word: Low, Medium, High, or Critical", 
  "potential_causes": ["List of potential causes"],
  "mitigation_steps": ["List of specific actionable steps"]
}

Security Alert Details:
- Alert Type: ${alert.alert_type}
- Description: ${alert.description}
- Severity: ${alert.severity}
- Timestamp: ${alert.timestamp}

Respond with JSON only:`;

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    // Call Gemini API for AI analysis - simplified without system instruction
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 512,
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

    // Extract and parse the AI response from Gemini's response format
    let aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate analysis at this time.';
    
    // Strip markdown code blocks if present
    aiResponse = aiResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    
    // Try to parse as JSON, fallback to structured response if parsing fails
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(aiResponse);
      // Ensure the response has the required structure
      if (!parsedAnalysis.summary || !parsedAnalysis.threat_level || !parsedAnalysis.mitigation_steps) {
        throw new Error('Missing required fields in AI response');
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON:', parseError);
      console.warn('Raw AI response:', aiResponse);
      parsedAnalysis = {
        summary: 'AI analysis completed but response format needs improvement',
        threat_level: alert.severity || 'Medium',
        potential_causes: ['Response parsing issue', 'Unexpected AI response format'],
        mitigation_steps: ['Review alert details manually', 'Check system logs for patterns', 'Consider updating alert thresholds']
      };
    }
    
    // Use the parsed analysis as the final response
    aiResponse = JSON.stringify(parsedAnalysis);

    // Update alert with AI analysis
    const aiAnalysisChat = [
      ...(alert.ai_analysis_chat || []),
      {
        role: 'user',
        content: userPrompt
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