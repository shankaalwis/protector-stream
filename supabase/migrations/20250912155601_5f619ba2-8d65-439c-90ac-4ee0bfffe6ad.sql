-- Add client_id to users table for Splunk integration
ALTER TABLE public.users 
ADD COLUMN client_id text;

-- Add index for better performance when looking up by client_id
CREATE INDEX idx_users_client_id ON public.users(client_id);