-- Drop the existing public policy on credit_costs
DROP POLICY IF EXISTS "Anyone can view credit costs" ON public.credit_costs;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can view credit costs"
ON public.credit_costs
FOR SELECT
TO authenticated
USING (true);