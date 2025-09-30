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
    const { alertId, userQuery } = await req.json();
    console.log('Request received:', { alertId, userQuery, hasUserQuery: !!userQuery });
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get alert details with device information
    const { data: alert, error: alertError } = await supabase
      .from('security_alerts')
      .select(`
        *,
        devices:device_id (
          device_name,
          client_id,
          ip_address,
          status
        )
      `)
      .eq('id', alertId)
      .single();

    if (alertError) {
      throw new Error(`Failed to fetch alert: ${alertError.message}`);
    }

    // Extract device information for context
    const device = alert.devices;
    const deviceContext = device ? {
      name: device.device_name,
      clientId: device.client_id,
      ipAddress: device.ip_address,
      status: device.status
    } : null;

    // Get Lovable API key from environment
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not found in environment variables');
    }

    // Helper function to call Lovable AI Gateway with exponential backoff
    async function callLovableAI(messages: any[], isConversational = false, maxRetries = 3) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages,
              temperature: isConversational ? 0.7 : 0.1, // Higher temperature for conversational responses
              max_tokens: 1000
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Lovable AI error (attempt ${attempt + 1}/${maxRetries}):`, errorText);
            
            if (response.status === 429) {
              throw new Error('Rate limits exceeded, please try again later.');
            }
            if (response.status === 402) {
              throw new Error('Payment required, please add funds to your Lovable AI workspace.');
            }
            
            if (attempt < maxRetries - 1) {
              const delay = Math.pow(2, attempt) * 1000;
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          if (attempt === maxRetries - 1) throw error;
          const delay = Math.pow(2, attempt) * 1000;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.log(`Retry ${attempt + 1} after ${delay}ms due to:`, errorMsg);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    let aiResponse: string;
    let updatedChat;

    // CONVERSATIONAL MODE: Handle follow-up questions
    if (userQuery) {
      console.log('Conversational mode: processing user query:', userQuery);
      
      // Get the original AI analysis from the chat history
      let originalAnalysis = null;
      const analysisMessages = alert.ai_analysis_chat || [];
      
      // Find the AI analysis response (usually the last AI message)
      for (let i = analysisMessages.length - 1; i >= 0; i--) {
        if (analysisMessages[i].role === 'ai' && analysisMessages[i].content.includes('summary')) {
          try {
            originalAnalysis = JSON.parse(analysisMessages[i].content);
            break;
          } catch (e) {
            // Continue looking if this isn't valid JSON
          }
        }
      }

      // Create detailed system message with original analysis context
      let systemMessage = `You are a friendly cybersecurity advisor helping someone understand their security alert.

ALERT DETAILS:
- Type: ${alert.alert_type}
- Description: ${alert.description}  
- Severity: ${alert.severity}
- Device: ${deviceContext?.name || 'Unknown device'} ${deviceContext?.clientId ? `(ID: ${deviceContext.clientId})` : ''}
- Timestamp: ${alert.timestamp}`;

      if (originalAnalysis) {
        systemMessage += `

PREVIOUS ANALYSIS:
- Summary: ${originalAnalysis.summary}
- Threat Level: ${originalAnalysis.threat_level}
- Potential Causes: ${originalAnalysis.potential_causes?.join(', ')}
- Mitigation Steps: ${originalAnalysis.mitigation_steps?.join(', ')}`;
      }

      systemMessage += `

CONVERSATION GUIDELINES:
1. Answer questions about THIS specific alert using the analysis above
2. When asked about "potential causes" - explain the specific causes listed above in simple terms
3. When asked "what is going on" - explain the summary in everyday language
4. Reference the device "${deviceContext?.name || 'your device'}" when relevant  
5. Use simple, non-technical language
6. Be helpful and specific to this alert`;

      // Build conversation history (excluding the original analysis to avoid duplication)
      const conversationHistory = (alert.ai_analysis_chat || [])
        .filter((msg: any) => !msg.content.includes('summary') || msg.role === 'user')
        .map((msg: any) => ({
          role: msg.role === 'ai' ? 'assistant' : msg.role,
          content: msg.content
        }));

      // Add the new user query
      conversationHistory.push({
        role: 'user',
        content: userQuery
      });

      const messages = [
        { role: 'system', content: systemMessage },
        ...conversationHistory
      ];

      console.log('Sending messages to AI:', { systemMessageLength: systemMessage.length, historyLength: conversationHistory.length });
      const aiData = await callLovableAI(messages, true); // true for conversational mode
      console.log('Lovable AI conversational response:', JSON.stringify(aiData, null, 2));

      aiResponse = aiData.choices?.[0]?.message?.content || 'Unable to generate response at this time.';

      // Update chat history with new Q&A
      updatedChat = [
        ...(alert.ai_analysis_chat || []),
        { role: 'user', content: userQuery },
        { role: 'ai', content: aiResponse }
      ];

    } else {
      // INITIAL ANALYSIS MODE: Generate structured analysis
      console.log('Initial analysis mode: generating structured report');
      
      // Create a concise, focused prompt for structured analysis
      const systemPrompt = `Analyze this security alert and provide a JSON response with exactly these fields:
{
  "summary": "Brief explanation in simple terms of what happened",
  "threat_level": "Low/Medium/High/Critical", 
  "potential_causes": ["List of 2-3 possible causes"],
  "mitigation_steps": ["List of 2-3 actionable steps"]
}

Alert Details:
- Type: ${alert.alert_type}
- Description: ${alert.description}
- Severity: ${alert.severity}${deviceContext ? `
- Device: ${deviceContext.name} (${deviceContext.clientId})` : ''}

Respond with valid JSON only.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Analyze this security alert.' }
      ];

      const aiData = await callLovableAI(messages, false); // false for structured analysis
      console.log('Lovable AI response:', JSON.stringify(aiData, null, 2));

      // Extract and parse the AI response
      let rawResponse = aiData.choices?.[0]?.message?.content;
      console.log('Raw AI response before processing:', rawResponse);
      
      if (!rawResponse) {
        console.error('No content in AI response');
        rawResponse = JSON.stringify({
          summary: `Security alert: ${alert.alert_type}. ${alert.description}`,
          threat_level: alert.severity || 'Medium',
          potential_causes: ['System detected suspicious activity', 'Requires investigation'],
          mitigation_steps: ['Review alert details', 'Check affected device', 'Monitor for patterns']
        });
      } else {
        // Strip markdown code blocks if present
        rawResponse = rawResponse.replace(/^```json\s*/m, '').replace(/\s*```$/m, '').trim();
        console.log('AI response after stripping markdown:', rawResponse);
      }
      
      // Try to parse as JSON, fallback to structured response if parsing fails
      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(rawResponse);
        console.log('Successfully parsed JSON:', parsedAnalysis);
        // Ensure the response has the required structure
        if (!parsedAnalysis.summary || !parsedAnalysis.threat_level || !parsedAnalysis.mitigation_steps) {
          throw new Error('Missing required fields in AI response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.error('Raw AI response that failed to parse:', rawResponse);
        parsedAnalysis = {
          summary: `Security alert: ${alert.alert_type}. ${alert.description}`,
          threat_level: alert.severity || 'Medium',
          potential_causes: ['System detected suspicious activity', 'Automatic analysis unavailable'],
          mitigation_steps: ['Review alert details', 'Check affected device', 'Monitor for patterns']
        };
      }
      
      // Use the parsed analysis as the final response
      aiResponse = JSON.stringify(parsedAnalysis);

      // Update alert with AI analysis
      updatedChat = [
        ...(alert.ai_analysis_chat || []),
        {
          role: 'user',
          content: systemPrompt
        },
        {
          role: 'ai',
          content: aiResponse
        }
      ];
    }

    const { error: updateError } = await supabase
      .from('security_alerts')
      .update({ 
        ai_analysis_chat: updatedChat,
        status: userQuery ? alert.status : (alert.status === 'unresolved' ? 'resolved' : alert.status) // Only change unresolved to resolved
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
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});