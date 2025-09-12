import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alertData = await req.json();
    console.log('Received Splunk alert:', alertData);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse Splunk alert data - adapt based on your Splunk configuration
    const {
      client_id,
      ip_address,
      alert_type,
      description,
      severity = 'medium'
    } = alertData;

    // Find matching device by client_id or ip_address
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .or(`client_id.eq.${client_id},ip_address.eq.${ip_address}`)
      .single();

    if (deviceError || !device) {
      console.error('Device not found:', { client_id, ip_address });
      return new Response(
        JSON.stringify({ 
          error: 'Device not found',
          client_id,
          ip_address
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create security alert
    const { error: alertError } = await supabase
      .from('security_alerts')
      .insert({
        device_id: device.id,
        alert_type: alert_type || 'Unknown Threat',
        description: description || 'Security alert detected by Splunk',
        severity: severity,
        status: 'unresolved'
      });

    if (alertError) {
      throw new Error(`Failed to create alert: ${alertError.message}`);
    }

    // Update device status to threat
    const { error: updateError } = await supabase
      .from('devices')
      .update({ status: 'threat' })
      .eq('id', device.id);

    if (updateError) {
      throw new Error(`Failed to update device status: ${updateError.message}`);
    }

    // Update network metrics
    const { data: metrics } = await supabase
      .from('network_metrics')
      .select('*')
      .eq('user_id', device.user_id)
      .single();

    if (metrics) {
      await supabase
        .from('network_metrics')
        .update({ 
          threats_detected: (metrics.threats_detected || 0) + 1 
        })
        .eq('user_id', device.user_id);
    }

    console.log('Successfully processed Splunk alert for device:', device.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Alert processed successfully',
        device_id: device.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in splunk-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});