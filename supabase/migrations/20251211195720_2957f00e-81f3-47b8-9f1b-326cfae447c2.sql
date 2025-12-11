-- Add zip_code column to enrollments table
ALTER TABLE public.enrollments 
ADD COLUMN zip_code TEXT;