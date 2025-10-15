-- =====================================================
-- AuraShield Backend Database Schema
-- Complete database structure for Smart Home Security System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- Stores user profile information and API keys
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT NOT NULL UNIQUE,
  firewall_api_key TEXT,
  phone_number TEXT,
  client_id TEXT,
  first_name TEXT,
  last_name TEXT
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- DEVICES TABLE
-- Stores IoT device information and status
-- =====================================================
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  mac_address TEXT,
  client_id TEXT NOT NULL,
  status TEXT DEFAULT 'safe',
  connected_since TIMESTAMPTZ DEFAULT NOW(),
  alerts JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for devices
CREATE POLICY "Users can view their own devices"
  ON public.devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices"
  ON public.devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices"
  ON public.devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices"
  ON public.devices FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- SECURITY ALERTS TABLE
-- Stores security incidents and AI analysis
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT DEFAULT 'unresolved',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ai_analysis_chat JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_alerts
CREATE POLICY "Users can view alerts for their devices"
  ON public.security_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.id = security_alerts.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert alerts"
  ON public.security_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update alerts for their devices"
  ON public.security_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.id = security_alerts.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- =====================================================
-- ANOMALY ALERTS TABLE
-- Stores ML-based anomaly detection results
-- =====================================================
CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  timestamp TIMESTAMPTZ NOT NULL,
  client_id TEXT NOT NULL,
  packet_count INTEGER NOT NULL,
  anomaly_score NUMERIC NOT NULL,
  is_anomaly BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anomaly_alerts
CREATE POLICY "Users can view their own anomaly alerts"
  ON public.anomaly_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert anomaly alerts"
  ON public.anomaly_alerts FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- OTP CODES TABLE
-- Stores one-time passwords for authentication
-- =====================================================
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for otp_codes
CREATE POLICY "Anyone can insert OTP codes"
  ON public.otp_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own OTP codes"
  ON public.otp_codes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update OTP codes"
  ON public.otp_codes FOR UPDATE
  USING (true);

-- =====================================================
-- DASHBOARD METRICS TABLE
-- Stores aggregated metrics for dashboard display
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  metric_key TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_key, user_id)
);

-- Enable RLS
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboard_metrics
CREATE POLICY "Users can view their own metrics"
  ON public.dashboard_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow system to insert metrics"
  ON public.dashboard_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow system to update metrics"
  ON public.dashboard_metrics FOR UPDATE
  USING (true);

-- =====================================================
-- NETWORK METRICS TABLE
-- Stores network-level statistics
-- =====================================================
CREATE TABLE IF NOT EXISTS public.network_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  total_devices INTEGER DEFAULT 0,
  threats_detected INTEGER DEFAULT 0,
  data_transferred_mb INTEGER DEFAULT 0,
  network_activity JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.network_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for network_metrics
CREATE POLICY "Users can view their own metrics"
  ON public.network_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON public.network_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON public.network_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, firewall_api_key, phone_number, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'firewall_api_key',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Create initial network metrics
  INSERT INTO public.network_metrics (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < NOW();
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_metrics_updated_at
  BEFORE UPDATE ON public.dashboard_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_network_metrics_updated_at
  BEFORE UPDATE ON public.network_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_client_id ON public.devices(client_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_device_id ON public.security_alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_user_id ON public.anomaly_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_user_id ON public.dashboard_metrics(user_id);
