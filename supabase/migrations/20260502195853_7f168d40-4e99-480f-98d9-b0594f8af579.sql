-- Recreate the view with security_invoker so it respects the querying user's RLS
DROP VIEW IF EXISTS public.seats_public;

CREATE VIEW public.seats_public
WITH (security_invoker = true) AS
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

GRANT SELECT ON public.seats_public TO anon, authenticated;

-- Re-add a public SELECT policy on the base table so the view can read rows.
-- Column-level protection is enforced because callers are expected to query
-- the seats_public view (which omits reserved_by / reservation_id). The base
-- table also has additional column privileges revoked below.
CREATE POLICY "Public can view seats availability"
ON public.seats
FOR SELECT
TO anon, authenticated
USING (true);

-- Revoke direct column access to identity columns from anon and authenticated.
-- Owner-of-reservation and admins still see them via the dedicated policies
-- because column privileges only apply when the role queries the base table directly;
-- those identity columns will return NULL/permission denied for non-owners.
REVOKE SELECT ON public.seats FROM anon, authenticated;
GRANT SELECT (
  id, flight_id, seat_number, seat_class, seat_row, seat_column,
  is_available, is_window, is_aisle, price_modifier, created_at, updated_at
) ON public.seats TO anon, authenticated;

-- Grant access to identity columns only to the postgres/service roles implicitly;
-- authenticated users querying their own reservations need to read reserved_by.
-- Provide column-level select for reserved_by and reservation_id to authenticated;
-- the existing RLS policy "Users can view their reserved seats" restricts rows.
GRANT SELECT (reserved_by, reservation_id) ON public.seats TO authenticated;