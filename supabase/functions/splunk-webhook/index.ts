import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from "npm:resend@2.0.0";

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
    const contentType = req.headers.get('content-type') || '';
    let incoming: any = null;

    try {
      if (contentType.includes('application/json')) {
        incoming = await req.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const form = await req.formData();
        const obj: Record<string, any> = {};
        for (const [k, v] of form.entries()) obj[k] = v;
        if (typeof obj.payload === 'string') {
          try { obj.payload = JSON.parse(obj.payload); } catch {}
        }
        if (typeof obj.result === 'string') {
          try { obj.result = JSON.parse(obj.result); } catch {}
        }
        incoming = obj;
      } else {
        // Fallback: try JSON then form
        try { incoming = await req.json(); }
        catch {
          const form = await req.formData();
          incoming = Object.fromEntries(form.entries());
        }
      }
    } catch (parseErr) {
      console.error('Failed to parse incoming request body:', parseErr);
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize common Splunk alert shapes
    const raw = incoming?.payload ?? incoming;
    const payload = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return incoming; } })() : raw;
    const primary = payload?.result ?? payload?.event ?? payload;

    const get = (obj: any, path: string) => path.split('.').reduce((o, k) => (o && typeof o === 'object') ? o[k] : undefined, obj);

    const client_id = primary?.Target_Username ?? primary?.client_id ?? primary?.clientId ?? get(primary, 'device.client_id') ?? payload?.client_id ?? incoming?.client_id;
    const ip_address = primary?.ip_address ?? primary?.ip ?? get(primary, 'device.ip_address') ?? payload?.ip_address ?? incoming?.ip_address;
    const alert_type = payload?.alert_type ?? primary?.alert_type ?? incoming?.alert_type ?? payload?.search_name ?? 'Unknown Threat';
    
    // Generate description based on alert type if not provided
    let description = payload?.description ?? primary?.description ?? incoming?.description;
    if (!description) {
      const alertTypeLower = alert_type.toLowerCase();
      if (alertTypeLower.includes('high volume') || alertTypeLower.includes('volume')) {
        const count = primary?.count ?? 'high';
        const topic = primary?.topic ?? 'unknown topic';
        description = `High volume of messages detected: ${count} messages on topic ${topic}`;
      } else if (alertTypeLower.includes('auth') || alertTypeLower.includes('login')) {
        const failedAttempts = primary?.failed_attempts || primary?.count || '';
        const attacker = primary?.Attacker_Client || primary?.source || 'unknown source';
        description = `Authentication failure detected - ${failedAttempts} failed attempts from ${attacker}`.trim();
      } else if (alertTypeLower.includes('brute force')) {
        const attacker = primary?.Attacker_Client || primary?.source || 'unknown source';
        description = `Brute force attack detected from ${attacker}`;
      } else if (alertTypeLower.includes('unauthorized')) {
        description = `Unauthorized access attempt detected`;
      } else {
        description = `Security alert detected: ${alert_type}`;
      }
    }
    
    const severity = (payload?.severity ?? primary?.severity ?? incoming?.severity ?? 'high') as string;

    console.log('Received Splunk alert (normalized):', { contentType, incoming, normalized: { client_id, ip_address, alert_type, description, severity } });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
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

    // Send email notification to user
    try {
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', device.user_id)
        .single();

      if (user?.email) {
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
        await resend.emails.send({
          from: "AuraShield Security <onboarding@resend.dev>",
          to: [user.email],
          subject: "🚨 Security Alert Detected",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 20px;">Security Alert Detected</h1>
              <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                AuraShield has detected a security alert on your network. Please check your dashboard immediately.
              </p>
              <a href="https://protector.shankaalwis.dev/" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Go to AuraShield
              </a>
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                This is an automated security notification from AuraShield.
              </p>
            </div>
          `,
        });
        console.log('Alert email sent to:', user.email);
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the webhook if email fails
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