
-- 1. Fix tickets resale: tighten WITH CHECK so buyers can only take ownership safely
DROP POLICY IF EXISTS "Users can purchase listed tickets" ON public.tickets;

CREATE POLICY "Users can purchase listed tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (is_resellable = true AND resell_status = 'listed')
WITH CHECK (
  user_id = auth.uid()
  AND resell_status = 'sold'
  AND is_resellable = false
  AND is_valid = (SELECT t.is_valid FROM public.tickets t WHERE t.id = tickets.id)
  AND ticket_number = (SELECT t.ticket_number FROM public.tickets t WHERE t.id = tickets.id)
  AND event_name = (SELECT t.event_name FROM public.tickets t WHERE t.id = tickets.id)
  AND event_date = (SELECT t.event_date FROM public.tickets t WHERE t.id = tickets.id)
  AND qr_code IS NOT DISTINCT FROM (SELECT t.qr_code FROM public.tickets t WHERE t.id = tickets.id)
  AND reservation_id IS NOT DISTINCT FROM (SELECT t.reservation_id FROM public.tickets t WHERE t.id = tickets.id)
);

-- 2. Scope user_roles admin policies to authenticated role only
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Prevent leaking reserved_by/reservation_id on publicly-visible available seats.
-- When a seat is released back to available, clear identity fields via trigger.
CREATE OR REPLACE FUNCTION public.clear_seat_reservation_on_available()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_available = true THEN
    NEW.reserved_by := NULL;
    NEW.reservation_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clear_seat_reservation ON public.seats;
CREATE TRIGGER trg_clear_seat_reservation
BEFORE INSERT OR UPDATE ON public.seats
FOR EACH ROW
EXECUTE FUNCTION public.clear_seat_reservation_on_available();

-- Backfill: clear identity on any currently-available seats
UPDATE public.seats
SET reserved_by = NULL, reservation_id = NULL
WHERE is_available = true
  AND (reserved_by IS NOT NULL OR reservation_id IS NOT NULL);
