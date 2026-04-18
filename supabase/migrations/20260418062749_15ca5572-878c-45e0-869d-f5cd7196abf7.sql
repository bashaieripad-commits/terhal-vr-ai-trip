
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS resell_price numeric;

-- Allow any authenticated user to purchase a listed ticket (transfer ownership)
DROP POLICY IF EXISTS "Users can purchase listed tickets" ON public.tickets;
CREATE POLICY "Users can purchase listed tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (is_resellable = true AND resell_status = 'listed')
WITH CHECK (true);
