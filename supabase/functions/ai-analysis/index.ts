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

    // Context-aware prompt that analyzes specific alert types
    const userPrompt = `You are a cybersecurity expert explaining security issues to non-technical business users. Analyze this SPECIFIC security alert and provide a tailored, context-aware explanation based on the exact alert type and details provided.

CRITICAL: Respond ONLY with valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object.

Required JSON format:
{
  "summary": "Specific explanation of what happened based on the alert type and details - not generic",
  "threat_level": "One word: Low, Medium, High, or Critical", 
  "potential_causes": ["List of specific causes related to this exact alert type"],
  "mitigation_steps": ["List of specific actionable steps for this exact alert type and situation"]
}

CONTEXT-AWARE ANALYSIS REQUIREMENTS:
- Your analysis must be SPECIFIC to the alert type provided
- For "HIGH VOLUME ALERT": Explain that someone is sending unusually large amounts of traffic/requests to the specific topic/system mentioned
- For device-specific alerts: Reference the specific device or system mentioned
- For topic-specific alerts (e.g., smart_home/living_room/light_control): Explain that traffic is targeting that specific control system
- Make the summary directly address what this specific alert means for the exact device and topic involved
- Potential causes should be specific to the alert type and topic (e.g., for high volume on light control: "Someone trying to repeatedly turn lights on/off", "Malicious attempts to control your smart lights", "Automated attacks targeting your light switches")
- Mitigation steps should be specific to the alert type and affected system (e.g., for light control: "Check your smart light bulbs for unusual behavior", "Temporarily disconnect the affected light from the network", "Review who has access to control your lights")

LANGUAGE GUIDELINES:
- Use simple, everyday language - avoid technical jargon
- Explain things as if talking to someone who doesn't know about cybersecurity
- Use plain English descriptions (e.g., "Someone flooding your light control system with commands" instead of "DDoS attack on IoT endpoint")
- Provide clear, actionable steps that anyone can understand
- When mentioning topics like "smart_home/living_room/light_control", explain it as "your living room light control system"

Security Alert Details to Analyze:
- Alert Type: ${alert.alert_type}
- Description: ${alert.description}
- Severity: ${alert.severity}
- Timestamp: ${alert.timestamp}${deviceContext ? `
- Device Name: ${deviceContext.name}
- Client ID: ${deviceContext.clientId}
- Device IP Address: ${deviceContext.ipAddress}
- Device Status: ${deviceContext.status}

DEVICE-SPECIFIC REQUIREMENTS:
- Reference the specific device "${deviceContext.name}" (Client ID: ${deviceContext.clientId}) in your analysis
- Make your summary explain what's happening to this specific device
- Tailor mitigation steps to actions that can be taken for this particular device
- Use the device name and type in your explanations to make it personal and actionable` : ''}

Analyze this SPECIFIC alert type and provide tailored responses. Respond with JSON only:`;

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    // Helper function to call Gemini API with exponential backoff
    async function callGeminiApi(contents: any[], systemInstruction?: any, maxRetries = 3) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const requestBody: any = {
            contents,
            generationConfig: {
              temperature: userQuery ? 0.7 : 0.1,
              topK: 1,
              topP: 0.8,
              maxOutputTokens: userQuery ? 1024 : 512,
            }
          };

          if (systemInstruction) {
            requestBody.systemInstruction = systemInstruction;
          }

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody)
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API error (attempt ${attempt + 1}/${maxRetries}):`, errorText);
            
            if (attempt < maxRetries - 1) {
              const delay = Math.pow(2, attempt) * 1000;
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
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
      console.log('Conversational mode: processing user query');
      
      const conversationalSystemInstruction = {
        parts: [{
          text: `You are the "Security Advisor" AI. Your sole purpose is to provide highly focused, non-technical, and supportive explanations regarding the specific security alert currently under discussion.

**YOUR PERSONA & TONE:**
1.  **Role:** Act as a friendly, patient, and knowledgeable home security expert.
2.  **Tone:** Be calm and reassuring. Use simple, everyday language (avoid jargon like 'DDoS' unless immediately followed by a simple explanation like 'a type of attack where...')
3.  **Focus:** **Crucially, your answers MUST be constrained to the specific alert details and device mentioned in the conversation history.** Do not answer questions unrelated to the security alert, the affected device, or general security concepts. If the user asks something irrelevant, gently redirect them: "That's a good question, but let's stay focused on the alert for now."

**BEHAVIOR GUIDELINES (Conversational Mode):**
1.  **Response Format:** Always respond with plain, conversational text. **NEVER** use JSON, markdown code blocks, or special formatting like lists or headings in your chat responses.
2.  **Context:** Maintain the full context of the discussion. Reference the device name and the nature of the alert in your answers to keep them focused and personal.
3.  **Actionable Advice:** When asked "What should I do?", prioritize repeating and simplifying the most relevant mitigation steps from the initial analysis.`
        }]
      };

      // Build conversation history from ai_analysis_chat
      const conversationHistory = (alert.ai_analysis_chat || []).map((msg: any) => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Add the new user query
      conversationHistory.push({
        role: 'user',
        parts: [{ text: userQuery }]
      });

      const geminiData = await callGeminiApi(conversationHistory, conversationalSystemInstruction);
      console.log('Gemini conversational response:', JSON.stringify(geminiData, null, 2));

      aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response at this time.';

      // Update chat history with new Q&A
      updatedChat = [
        ...(alert.ai_analysis_chat || []),
        { role: 'user', content: userQuery },
        { role: 'ai', content: aiResponse }
      ];

    } else {
      // INITIAL ANALYSIS MODE: Generate structured analysis
      console.log('Initial analysis mode: generating structured report');
      
      const geminiData = await callGeminiApi([{
        parts: [{ text: userPrompt }]
      }]);
      console.log('Gemini API response:', JSON.stringify(geminiData, null, 2));

      // Extract and parse the AI response from Gemini's response format
      let rawResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate analysis at this time.';
      console.log('Raw AI response before processing:', rawResponse);
      
      // Strip markdown code blocks if present
      rawResponse = rawResponse.replace(/^```json\s*/m, '').replace(/\s*```$/m, '').trim();
      console.log('AI response after stripping markdown:', rawResponse);
      
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
          summary: 'AI analysis completed but response format needs improvement',
          threat_level: alert.severity || 'Medium',
          potential_causes: ['Response parsing issue', 'Unexpected AI response format'],
          mitigation_steps: ['Review alert details manually', 'Check system logs for patterns', 'Consider updating alert thresholds']
        };
      }
      
      // Use the parsed analysis as the final response
      aiResponse = JSON.stringify(parsedAnalysis);

      // Update alert with AI analysis
      updatedChat = [
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
    }

    const { error: updateError } = await supabase
      .from('security_alerts')
      .update({ 
        ai_analysis_chat: updatedChat,
        status: userQuery ? alert.status : 'resolved' // Don't change status for follow-up questions
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