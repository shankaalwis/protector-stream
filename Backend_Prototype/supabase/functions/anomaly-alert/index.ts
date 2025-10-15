import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

interface AnomalyAlert {
  timestamp: string;
  client_id: string;
  packet_count: number;
  anomaly_score: number;
  is_anomaly: boolean;
}

const HARDCODED_USER_ID = "9e41ec3a-367d-4104-8631-99fffa82fd07";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the request body
    const alertData: AnomalyAlert = await req.json();
    console.log('Received anomaly alert:', alertData);

    // Validate required fields
    if (!alertData.timestamp || !alertData.client_id || alertData.packet_count === undefined || 
        alertData.anomaly_score === undefined || alertData.is_anomaly === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate data types
    if (typeof alertData.client_id !== 'string' || 
        typeof alertData.packet_count !== 'number' ||
        typeof alertData.anomaly_score !== 'number' ||
        typeof alertData.is_anomaly !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Invalid data types' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert the anomaly alert into the database
    const { data, error } = await supabase
      .from('anomaly_alerts')
      .insert([
        {
          timestamp: alertData.timestamp,
          client_id: alertData.client_id,
          packet_count: alertData.packet_count,
          anomaly_score: alertData.anomaly_score,
          is_anomaly: alertData.is_anomaly,
          user_id: HARDCODED_USER_ID,
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save anomaly alert', details: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Successfully saved anomaly alert:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Anomaly alert saved successfully',
        id: data[0].id 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing anomaly alert:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
