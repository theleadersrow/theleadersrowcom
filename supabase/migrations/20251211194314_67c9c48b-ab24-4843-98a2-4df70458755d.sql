-- Fix 1: Add admin-only SELECT policy for email_leads table
CREATE POLICY "Admins can view email leads"
ON public.email_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Drop the overly permissive enrollment code check policy
DROP POLICY IF EXISTS "Anyone can check enrollment codes" ON public.enrollments;

-- Fix 3: Create a secure function that only returns whether an enrollment code exists
CREATE OR REPLACE FUNCTION public.check_enrollment_code(code TEXT)
RETURNS TABLE(is_valid BOOLEAN, enrollment_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE enrollment_code = code AND user_id IS NULL
    ) as is_valid,
    (
      SELECT id FROM public.enrollments 
      WHERE enrollment_code = code AND user_id IS NULL
      LIMIT 1
    ) as enrollment_id
$$;

-- Fix 4: Tighten the enrollment claim UPDATE policy
DROP POLICY IF EXISTS "Users can claim their enrollment" ON public.enrollments;

CREATE POLICY "Users can claim their enrollment"
ON public.enrollments
FOR UPDATE
USING ((enrollment_code IS NOT NULL) AND (user_id IS NULL))
WITH CHECK (user_id = auth.uid());