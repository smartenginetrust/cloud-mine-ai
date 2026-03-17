
-- Add admin policies for withdrawals table
CREATE POLICY "Admins can view all withdrawals"
ON public.withdrawals
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update withdrawals"
ON public.withdrawals
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
