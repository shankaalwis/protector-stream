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
    const { deviceId, action } = await req.json(); // action: 'block' or 'unblock'
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get device and user info
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select(`
        *,
        profiles!inner(firewall_api_key)
      `)
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      throw new Error('Device not found');
    }

    const firewallApiKey = device.profiles.firewall_api_key;
    if (!firewallApiKey) {
      throw new Error('Firewall API key not configured');
    }

    // Make firewall API call - replace with your actual firewall API
    const firewallResponse = await fetch('https://api.your-firewall.com/v1/rules', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firewallApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        ip_address: device.ip_address,
        rule_name: `${action}_${device.device_name}`
      }),
    });

    if (!firewallResponse.ok) {
      throw new Error(`Firewall API error: ${firewallResponse.statusText}`);
    }

    // Update device status
    const newStatus = action === 'block' ? 'blocked' : 'safe';
    const { error: updateError } = await supabase
      .from('devices')
      .update({ status: newStatus })
      .eq('id', deviceId);

    if (updateError) {
      throw new Error(`Failed to update device status: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Device ${action}ed successfully`,
        status: newStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in firewall-control function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});