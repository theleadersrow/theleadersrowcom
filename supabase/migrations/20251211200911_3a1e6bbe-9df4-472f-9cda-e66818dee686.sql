-- Make user_id nullable to allow admin to create enrollments before users claim them
ALTER TABLE public.enrollments ALTER COLUMN user_id DROP NOT NULL;