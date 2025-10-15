import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let parsedBody: any = {};

    if (contentType.includes('application/json')) {
      parsedBody = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      parsedBody = Object.fromEntries(params.entries());
    } else {
      parsedBody = await req.json();
    }

    console.log('Received Splunk webhook:', parsedBody);

    // Normalize Splunk alert structure
    const result = parsedBody.result || parsedBody;
    const client_id = result.client_id || result.targeted_client || result.ClientIdentifier;
    const ip_address = result.src_ip || result.src || result.IPAddress;
    const alert_type = result.alert_type || parsedBody.search_name || 'Security Alert';
    const description = result.description || result.message || JSON.stringify(result);
    const severity = result.severity || result.priority || 'medium';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find matching device
    let device = null;
    if (client_id) {
      const { data } = await supabase
        .from('devices')
        .select('*, users!inner(email)')
        .eq('client_id', client_id)
        .single();
      device = data;
    }

    if (!device && ip_address) {
      const { data } = await supabase
        .from('devices')
        .select('*, users!inner(email)')
        .eq('ip_address', ip_address)
        .single();
      device = data;
    }

    if (!device) {
      console.log('No matching device found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No matching device found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    // Create security alert
    const { data: alertData, error: alertError } = await supabase
      .from('security_alerts')
      .insert({
        device_id: device.id,
        alert_type: alert_type,
        description: description,
        severity: severity,
        status: 'unresolved'
      })
      .select()
      .single();

    if (alertError) {
      console.error('Error creating security alert:', alertError);
      throw alertError;
    }

    // Update device status
    await supabase
      .from('devices')
      .update({ status: 'threat' })
      .eq('id', device.id);

    // Increment threat counter
    await supabase.rpc('increment', {
      row_id: device.user_id,
      x: 1
    });

    // Send email notification
    try {
      if (device.users?.email) {
        await resend.emails.send({
          from: "AuraShield Security <security@shankaalwis.dev>",
          to: [device.users.email],
          subject: `Security Alert: ${alert_type}`,
          html: `
            <h2>Security Alert Detected</h2>
            <p><strong>Device:</strong> ${device.device_name}</p>
            <p><strong>Alert Type:</strong> ${alert_type}</p>
            <p><strong>Severity:</strong> ${severity}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p>Please check your AuraShield dashboard for more details.</p>
          `,
        });
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alert_id: alertData.id,
        device_id: device.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing Splunk webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
