-- Update the handle_new_user function to include first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;