import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Metrics ingest endpoint called');
    
    const payload = await req.json();
    console.log('Received payload:', JSON.stringify(payload));

    // Extract metric_key from Splunk's search_name
    const metric_key = payload.search_name || 'message_throughput_60m';
    
    // Extract time and value from Splunk's result object
    const result = payload.result;
    if (!result || !result.time || !result.value) {
      throw new Error('Invalid payload: missing result.time or result.value');
    }

    // Convert epoch seconds to milliseconds and parse value
    const time_epoch = parseInt(result.time) * 1000;
    const throughput = parseInt(result.value);

    console.log('Processing metric:', { time_epoch, throughput });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch existing data for rolling history
    const { data: existingData, error: fetchError } = await supabase
      .from('dashboard_metrics')
      .select('metric_value')
      .eq('metric_key', metric_key)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing data:', fetchError);
      throw new Error(`Failed to fetch existing data: ${fetchError.message}`);
    }

    // Get existing array or start with empty array
    let dataPoints = [];
    if (existingData && existingData.metric_value) {
      dataPoints = Array.isArray(existingData.metric_value) 
        ? existingData.metric_value 
        : [];
    }

    // Append new data point
    dataPoints.push({ time_epoch, throughput });

    // Keep only the last 60 points
    if (dataPoints.length > 60) {
      dataPoints = dataPoints.slice(-60);
    }

    console.log(`Rolling history: ${dataPoints.length} points`);

    // Upsert the updated array
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .upsert({
        metric_key,
        metric_value: dataPoints,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'metric_key'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to store metric: ${error.message}`);
    }

    console.log('Successfully stored metric with rolling history');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Metric stored successfully',
        metric_key,
        points_stored: dataPoints.length,
        data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in metrics-ingest function:', error);
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
