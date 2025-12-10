-- Fix search_path for the function
CREATE OR REPLACE FUNCTION public.generate_enrollment_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'TLR-' || upper(substr(md5(random()::text), 1, 8));
  RETURN code;
END;
$$;