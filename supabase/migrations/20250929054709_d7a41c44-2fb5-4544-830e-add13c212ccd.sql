-- Create anomaly_alerts table for storing real-time anomaly data
CREATE TABLE public.anomaly_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  client_id TEXT NOT NULL,
  packet_count INTEGER NOT NULL,
  anomaly_score DECIMAL NOT NULL,
  is_anomaly BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for public reading (since this is monitoring data)
CREATE POLICY "Allow public read access to anomaly alerts" 
ON public.anomaly_alerts 
FOR SELECT 
USING (true);

-- Create policy for system inserts (webhook endpoint)
CREATE POLICY "Allow system insert for anomaly alerts" 
ON public.anomaly_alerts 
FOR INSERT 
WITH CHECK (true);

-- Enable real-time for the table
ALTER TABLE public.anomaly_alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anomaly_alerts;