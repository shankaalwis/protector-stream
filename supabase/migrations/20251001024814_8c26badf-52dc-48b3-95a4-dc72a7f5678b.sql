-- Create dashboard_metrics table for flexible metric storage
CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key TEXT NOT NULL UNIQUE,
  metric_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read metrics
CREATE POLICY "Allow authenticated users to read metrics"
  ON public.dashboard_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow system to insert/update metrics (for webhook)
CREATE POLICY "Allow system to insert metrics"
  ON public.dashboard_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow system to update metrics"
  ON public.dashboard_metrics
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_dashboard_metrics_key ON public.dashboard_metrics(metric_key);

-- Add trigger for updated_at
CREATE TRIGGER update_dashboard_metrics_updated_at
  BEFORE UPDATE ON public.dashboard_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for dashboard_metrics table
ALTER TABLE public.dashboard_metrics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_metrics;