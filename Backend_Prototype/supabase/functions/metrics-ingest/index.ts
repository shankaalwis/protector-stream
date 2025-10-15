import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const HARDCODED_USER_ID = "9e41ec3a-367d-4104-8631-99fffa82fd07";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Metrics ingest endpoint called');
    
    const payload = await req.json();
    console.log('Received payload:', JSON.stringify(payload));

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const metric_key = payload.search_name || payload.metric_key;
    console.log('Processing metric_key:', metric_key);

    let metricValue: any;
    let metricData: any;

    // Handle different metric types
    if (metric_key === 'top_targeted_clients') {
      const topClients = payload.data || [];
      metricData = topClients.map((item: any) => ({
        targeted_client: item.targeted_client,
        failure_count: parseInt(item.failure_count)
      }));
      console.log('Processing top targeted clients metric:', { 
        time_epoch: payload.timestamp,
        count: topClients.length 
      });
      metricValue = { data: metricData, timestamp: payload.timestamp };
    } 
    else if (metric_key === 'top_busiest_topics') {
      const topTopics = payload.data || [];
      metricData = topTopics.map((item: any) => ({
        topic_name: item.topic_name,
        message_count: parseInt(item.message_count)
      }));
      console.log('Processing top busiest topics metric:', { 
        time_epoch: payload.timestamp,
        count: topTopics.length 
      });
      metricValue = { data: metricData, timestamp: payload.timestamp };
    }
    else if (metric_key === 'Failed Auth Attempts (24h) Webhook') {
      const failedAttempts = parseInt(payload.result?.total_failed_attempts || '0');
      const timeEpoch = parseInt(payload.result?.time || Date.now().toString());
      console.log('Processing failed auth metric:', { 
        time_epoch: timeEpoch,
        total_failed_attempts: failedAttempts 
      });
      metricValue = { value: failedAttempts, timestamp: timeEpoch };
    }
    else if (metric_key === 'successful_connections_24h') {
      const successfulConnections = parseInt(payload.result?.successful_connections || '0');
      const timeEpoch = parseInt(payload.result?.time || Date.now().toString());
      console.log('Processing successful connections metric:', { 
        time_epoch: timeEpoch,
        successful_connections: successfulConnections 
      });
      metricValue = { value: successfulConnections, timestamp: timeEpoch };
    }
    else if (metric_key === 'Dashboard Data: Message Throughput (New)') {
      const throughput = parseInt(payload.result?.value || '0');
      const timeEpoch = parseInt(payload.result?.time || Date.now().toString());
      console.log('Processing metric:', { time_epoch: timeEpoch, throughput });
      
      // Fetch existing metric data
      const { data: existingData, error: fetchError } = await supabase
        .from('dashboard_metrics')
        .select('metric_value')
        .eq('metric_key', metric_key)
        .eq('user_id', HARDCODED_USER_ID)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing data:', fetchError);
      }

      let rollingHistory = existingData?.metric_value?.history || [];
      
      // Append new data point
      rollingHistory.push({
        time: timeEpoch,
        value: throughput
      });

      // Keep only the last 60 data points
      if (rollingHistory.length > 60) {
        rollingHistory = rollingHistory.slice(-60);
      }

      console.log('Rolling history:', rollingHistory.length, 'points');
      metricValue = { history: rollingHistory };
    }

    // Upsert the metric
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .upsert({
        metric_key: metric_key,
        metric_value: metricValue,
        user_id: HARDCODED_USER_ID,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'metric_key,user_id'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Successfully stored metric with rolling history');

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in metrics-ingest function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
