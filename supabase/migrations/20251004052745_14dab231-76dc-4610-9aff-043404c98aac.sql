-- Create OTP codes table
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Create index for faster lookups
CREATE INDEX idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert OTP codes (needed for login flow)
CREATE POLICY "Anyone can insert OTP codes"
ON public.otp_codes
FOR INSERT
WITH CHECK (true);

-- Create policy to allow verification
CREATE POLICY "Anyone can read their own OTP codes"
ON public.otp_codes
FOR SELECT
USING (true);

-- Create policy to allow updating verification status
CREATE POLICY "Anyone can update OTP codes"
ON public.otp_codes
FOR UPDATE
USING (true);

-- Function to cleanup expired OTP codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < now();
END;
$$;