-- Add member details to enrollments
ALTER TABLE public.enrollments
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN country TEXT,
ADD COLUMN occupation TEXT;