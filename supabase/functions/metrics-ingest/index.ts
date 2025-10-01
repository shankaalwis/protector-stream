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

    // Extract metric_key and data from the payload
    // Splunk reports typically send results as an array
    const metric_key = payload.metric_key || payload.search_name || 'unknown_metric';
    const metric_value = payload.results || payload.result || payload.data || payload;

    console.log('Processing metric:', { metric_key, dataLength: Array.isArray(metric_value) ? metric_value.length : 'not-array' });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upsert to dashboard_metrics table
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .upsert({
        metric_key,
        metric_value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'metric_key'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to store metric: ${error.message}`);
    }

    console.log('Successfully stored metric:', metric_key);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Metric stored successfully',
        metric_key,
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
