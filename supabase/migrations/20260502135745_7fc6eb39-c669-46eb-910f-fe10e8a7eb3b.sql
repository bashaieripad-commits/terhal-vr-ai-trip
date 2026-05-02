
-- 1. Fix seats UPDATE policy: prevent price/class manipulation, force reserved_by = auth.uid()
DROP POLICY IF EXISTS "Users can reserve seats" ON public.seats;

CREATE POLICY "Users can reserve seats"
ON public.seats
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND is_available = true)
WITH CHECK (
  reserved_by = auth.uid()
  AND price_modifier = (SELECT s.price_modifier FROM public.seats s WHERE s.id = seats.id)
  AND seat_class    = (SELECT s.seat_class    FROM public.seats s WHERE s.id = seats.id)
  AND seat_number   = (SELECT s.seat_number   FROM public.seats s WHERE s.id = seats.id)
  AND seat_row      = (SELECT s.seat_row      FROM public.seats s WHERE s.id = seats.id)
  AND seat_column   = (SELECT s.seat_column   FROM public.seats s WHERE s.id = seats.id)
  AND flight_id     = (SELECT s.flight_id     FROM public.seats s WHERE s.id = seats.id)
);

-- 2. Payments: add INSERT (own), DELETE (admin), and WITH CHECK on admin updates
CREATE POLICY "Users can create their own payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete payments"
ON public.payments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Re-create admin update with WITH CHECK
DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
CREATE POLICY "Admins can update all payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. user_roles: explicit restrictive policies blocking self-escalation
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. has_role: prevent role enumeration via RPC. Revoke from anon/authenticated.
-- The function still works inside RLS policy expressions (executed by db engine, not via RPC).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;

-- 5. Fix mutable search_path on update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
