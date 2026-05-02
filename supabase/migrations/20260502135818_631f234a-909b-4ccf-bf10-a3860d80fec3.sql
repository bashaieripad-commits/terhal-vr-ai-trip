
REVOKE EXECUTE ON FUNCTION public.generate_flight_seats(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.auto_generate_seats() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
