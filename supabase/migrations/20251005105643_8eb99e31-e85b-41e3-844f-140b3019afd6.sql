-- Drop the insecure policy that allows all operations with no restrictions
DROP POLICY IF EXISTS "Allow all operations on feedback" ON public.feedback;

-- Create restrictive policies based on user roles

-- Agents and admins can view feedback
CREATE POLICY "Agents and admins can view feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'agent'::app_role) OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Agents and admins can insert feedback (needed for manual entries)
CREATE POLICY "Agents and admins can insert feedback"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'agent'::app_role) OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can update feedback
CREATE POLICY "Only admins can update feedback"
ON public.feedback
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete feedback
CREATE POLICY "Only admins can delete feedback"
ON public.feedback
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));