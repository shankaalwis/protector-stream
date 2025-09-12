-- Create users profiles table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  firewall_api_key TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create devices table
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  mac_address TEXT,
  client_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('safe', 'threat', 'blocked')) DEFAULT 'safe',
  connected_since TIMESTAMP WITH TIME ZONE DEFAULT now(),
  alerts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, ip_address),
  UNIQUE(user_id, client_id)
);

-- Create security_alerts table
CREATE TABLE public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT CHECK (status IN ('unresolved', 'resolved', 'closed')) DEFAULT 'unresolved',
  ai_analysis_chat JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create network_metrics table
CREATE TABLE public.network_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  total_devices INTEGER DEFAULT 0,
  threats_detected INTEGER DEFAULT 0,
  data_transferred_mb INTEGER DEFAULT 0,
  network_activity JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for devices table
CREATE POLICY "Users can view their own devices" ON public.devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" ON public.devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" ON public.devices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" ON public.devices
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for security_alerts table
CREATE POLICY "Users can view alerts for their devices" ON public.security_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.devices 
      WHERE devices.id = security_alerts.device_id 
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts for their devices" ON public.security_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.devices 
      WHERE devices.id = security_alerts.device_id 
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert alerts" ON public.security_alerts
  FOR INSERT WITH CHECK (true);

-- RLS Policies for network_metrics table
CREATE POLICY "Users can view their own metrics" ON public.network_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics" ON public.network_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics" ON public.network_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, firewall_API_key, phone_number)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'firewall_api_key',
    NEW.raw_user_meta_data->>'phone_number'
  );
  
  -- Create initial network metrics
  INSERT INTO public.network_metrics (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_network_metrics_updated_at
  BEFORE UPDATE ON public.network_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.network_metrics;