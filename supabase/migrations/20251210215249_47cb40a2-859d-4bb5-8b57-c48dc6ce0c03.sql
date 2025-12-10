-- Add zoom link and notes to enrollments
ALTER TABLE public.enrollments
ADD COLUMN zoom_link TEXT,
ADD COLUMN notes TEXT,
ADD COLUMN start_date DATE;

-- Add resource assignments table
CREATE TABLE public.enrollment_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'link',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.enrollment_resources ENABLE ROW LEVEL SECURITY;

-- RLS for resources - admins can manage, users can view their own
CREATE POLICY "Admins can manage resources"
ON public.enrollment_resources
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their enrollment resources"
ON public.enrollment_resources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.id = enrollment_resources.enrollment_id
    AND enrollments.user_id = auth.uid()
  )
);

-- Allow admins to insert user roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow first admin signup (when no admins exist)
CREATE POLICY "Allow first admin signup"
ON public.user_roles
FOR INSERT
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  AND role = 'admin'
);