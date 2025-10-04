-- Add user_id to anomaly_alerts table
ALTER TABLE public.anomaly_alerts 
ADD COLUMN user_id UUID;

-- Add foreign key constraint
ALTER TABLE public.anomaly_alerts 
ADD CONSTRAINT anomaly_alerts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- Backfill existing data for user 9e41ec3a-367d-4104-8631-99fffa82fd07
UPDATE public.anomaly_alerts 
SET user_id = '9e41ec3a-367d-4104-8631-99fffa82fd07';

-- Drop existing public RLS policies
DROP POLICY IF EXISTS "Allow public read access to anomaly alerts" ON public.anomaly_alerts;
DROP POLICY IF EXISTS "Allow system insert for anomaly alerts" ON public.anomaly_alerts;

-- Create new user-specific RLS policies
CREATE POLICY "Users can view their own anomaly alerts" 
ON public.anomaly_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert anomaly alerts" 
ON public.anomaly_alerts 
FOR INSERT 
WITH CHECK (true);

-- Add user_id to dashboard_metrics table
ALTER TABLE public.dashboard_metrics 
ADD COLUMN user_id UUID;

-- Add foreign key constraint
ALTER TABLE public.dashboard_metrics 
ADD CONSTRAINT dashboard_metrics_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- Backfill existing data for user 9e41ec3a-367d-4104-8631-99fffa82fd07
UPDATE public.dashboard_metrics 
SET user_id = '9e41ec3a-367d-4104-8631-99fffa82fd07';

-- Update existing RLS policies for dashboard_metrics
DROP POLICY IF EXISTS "Allow authenticated users to read metrics" ON public.dashboard_metrics;

CREATE POLICY "Users can view their own metrics" 
ON public.dashboard_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Keep system policies for inserts and updates (needed for edge functions)
-- These already exist, no changes needed for INSERT and UPDATE policies