import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnomalyAlert {
  timestamp: string;
  client_id: string;
  packet_count: number;
  anomaly_score: number;
  is_anomaly: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const body = await req.json() as AnomalyAlert;
    
    console.log('Received anomaly alert:', body);

    // Validate required fields
    const requiredFields = ['timestamp', 'client_id', 'packet_count', 'anomaly_score', 'is_anomaly'];
    const missingFields = requiredFields.filter(field => !(field in body));
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missing: missingFields 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate data types
    if (typeof body.packet_count !== 'number' || 
        typeof body.anomaly_score !== 'number' || 
        typeof body.is_anomaly !== 'boolean') {
      console.error('Invalid data types in payload');
      return new Response(
        JSON.stringify({ error: 'Invalid data types' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Insert anomaly alert into database
    const { data, error } = await supabase
      .from('anomaly_alerts')
      .insert({
        timestamp: body.timestamp,
        client_id: body.client_id,
        packet_count: body.packet_count,
        anomaly_score: body.anomaly_score,
        is_anomaly: body.is_anomaly
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save alert' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully saved anomaly alert:', data);

    // Return success response
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Alert received and processed',
        id: data[0]?.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});