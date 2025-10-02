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

    // Extract metric_key from Splunk's search_name or use the provided metric_key
    const metric_key = payload.metric_key || payload.search_name || 'message_throughput_60m';
    
    // Handle different metric types
    // Top Targeted Clients - array of top 5 clients with failure counts
    if (metric_key === 'top_targeted_clients' && payload.data && Array.isArray(payload.data)) {
      const time_epoch = payload.timestamp || Date.now();
      const topClients = payload.data.slice(0, 5); // Ensure max 5 records

      console.log('Processing top targeted clients metric:', { time_epoch, count: topClients.length });

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data, error } = await supabase
        .from('dashboard_metrics')
        .upsert({
          metric_key,
          metric_value: { time_epoch, data: topClients },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'metric_key'
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to store metric: ${error.message}`);
      }

      console.log('Successfully stored top targeted clients metric');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Top targeted clients metric stored successfully',
          metric_key,
          data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract time and value from Splunk's result object
    const result = payload.result;
    if (!result || !result.time) {
      throw new Error('Invalid payload: missing result.time');
    }
    
    if (result.total_failed_attempts !== undefined) {
      // Failed Auth Attempts - single value, no history
      const time_epoch = parseInt(result.time) * 1000;
      const total_failed_attempts = parseInt(result.total_failed_attempts);

      console.log('Processing failed auth metric:', { time_epoch, total_failed_attempts });

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data, error } = await supabase
        .from('dashboard_metrics')
        .upsert({
          metric_key,
          metric_value: { time_epoch, total_failed_attempts },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'metric_key'
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to store metric: ${error.message}`);
      }

      console.log('Successfully stored failed auth metric');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Failed auth metric stored successfully',
          metric_key,
          data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Successful Connections - single value, no history
    if (result.successful_connections !== undefined) {
      const time_epoch = parseInt(result.time) * 1000;
      const successful_connections = parseInt(result.successful_connections);

      console.log('Processing successful connections metric:', { time_epoch, successful_connections });

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data, error } = await supabase
        .from('dashboard_metrics')
        .upsert({
          metric_key,
          metric_value: { time_epoch, value: successful_connections },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'metric_key'
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to store metric: ${error.message}`);
      }

      console.log('Successfully stored successful connections metric');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Successful connections metric stored successfully',
          metric_key,
          data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Message Throughput - rolling history
    if (!result.value) {
      throw new Error('Invalid payload: missing result.value');
    }

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
