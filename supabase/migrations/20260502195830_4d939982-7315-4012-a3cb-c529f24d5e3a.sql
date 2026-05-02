-- Harden seats table: restrict row-level access to base table so identity columns
-- (reserved_by, reservation_id) are not readable by the public. Provide a safe
-- public view exposing only non-sensitive columns for seat-map browsing.

-- 1) Drop the broad public SELECT policy on the base table
DROP POLICY IF EXISTS "Anyone can view available seats" ON public.seats;

-- 2) Keep existing policies:
--    - "Users can view their reserved seats" (auth.uid() = reserved_by)
--    - "Admins can view all seats" (has_role admin)
--    - "Admins can manage seats" (ALL, admin)
--    - "Users can reserve seats" (UPDATE with strict WITH CHECK)

-- 3) Create a safe public view exposing only non-identity columns.
--    SECURITY INVOKER ensures RLS on underlying table still applies, but since
--    we want public read of availability, we use security_barrier + a definer
--    function pattern via a view owned by postgres with explicit column list.
CREATE OR REPLACE VIEW public.seats_public
WITH (security_invoker = false, security_barrier = true) AS
SELECT
  id,
  flight_id,
  seat_number,
  seat_class,
  seat_row,
  seat_column,
  is_available,
  is_window,
  is_aisle,
  price_modifier,
  created_at,
  updated_at
FROM public.seats;

-- Grant read on the safe view to anon and authenticated
GRANT SELECT ON public.seats_public TO anon, authenticated;

-- Revoke any direct table SELECT from anon (authenticated still gated by RLS policies above)
REVOKE SELECT ON public.seats FROM anon;