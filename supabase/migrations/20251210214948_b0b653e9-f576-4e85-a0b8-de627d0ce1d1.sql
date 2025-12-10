-- Add enrollment code to enrollments table
ALTER TABLE public.enrollments
ADD COLUMN enrollment_code TEXT UNIQUE,
ADD COLUMN email TEXT;

-- Create function to generate enrollment code
CREATE OR REPLACE FUNCTION public.generate_enrollment_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'TLR-' || upper(substr(md5(random()::text), 1, 8));
  RETURN code;
END;
$$;

-- Set default for new enrollments
ALTER TABLE public.enrollments
ALTER COLUMN enrollment_code SET DEFAULT public.generate_enrollment_code();

-- Allow anyone to check enrollment code (for signup validation)
CREATE POLICY "Anyone can check enrollment codes"
ON public.enrollments
FOR SELECT
USING (enrollment_code IS NOT NULL AND user_id IS NULL);

-- Allow updating enrollment with user_id during signup
CREATE POLICY "Users can claim their enrollment"
ON public.enrollments
FOR UPDATE
USING (enrollment_code IS NOT NULL AND user_id IS NULL)
WITH CHECK (true);