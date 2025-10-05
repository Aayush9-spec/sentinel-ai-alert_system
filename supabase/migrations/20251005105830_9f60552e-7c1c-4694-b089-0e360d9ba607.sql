-- Drop the insecure policy that allows all users to view all role assignments
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

-- Create a policy that allows users to view only their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a policy that allows admins to view all roles (for administration purposes)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));